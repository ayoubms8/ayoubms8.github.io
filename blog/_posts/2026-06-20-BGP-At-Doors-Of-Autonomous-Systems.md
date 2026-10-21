---
title: BGP - At Doors of Autonomous Systems
date: 2026-06-20 11:00:00 +0100
categories: [Networking, Routing, Infrastructure]
tags: [BGP, VXLAN, GNS3, FRRouting, Networking, EVPN, Underlay, Overlay, Docker]
render_with_liquid: false
---

# Introduction

Border Gateway Protocol (BGP) is the routing protocol that holds the internet together. It is the only protocol designed to exchange routing information between independently administered networks — called Autonomous Systems (AS) — at internet scale. While interior routing protocols like OSPF or EIGRP manage routes within a single organization's network, BGP manages routes **between** organizations, ISPs, and data centers. Every time you visit a website, BGP is what ensures your packets take a valid path across the dozens of networks between you and the server.

# Project Goals

BGP At Doors of Autonomous Systems is a 1337 school project focused on network virtualization and dynamic routing. The project is divided into three progressive parts:

- **Part 1**: Build a simple GNS3 topology — one router and one host — and get comfortable with FRRouting, interface configuration, and basic IP connectivity.
- **Part 2**: Extend the topology with a central switch and multiple router+host pairs. Layer VXLAN tunnels over the IP underlay to create a virtual L2 overlay using a **flood-and-learn** control plane.
- **Part 3**: Replace the flood-and-learn VXLAN control plane with a **BGP EVPN** control plane using FRRouting, simulating a modern data center leaf-spine fabric.

Each part builds directly on the previous one, progressively moving from basic connectivity to full BGP-driven MAC/IP distribution.

# Network Architecture Overview

## Part 1 — Simple Router + Host

    ┌─────────────────────────────────────┐
    │            GNS3 Topology            │
    │                                     │
    │   ┌─────────────┐   ┌───────────┐  │
    │   │   Router 1  │   │  Host 1   │  │
    │   │  (FRRouting)│───│  (Alpine) │  │
    │   │   eth0 (WAN)│   └───────────┘  │
    │   └─────────────┘                  │
    └─────────────────────────────────────┘

One FRRouting router, one Alpine host. The goal is simply to configure interfaces, verify routing, and get familiar with `vtysh`.

## Parts 2 & 3 — VXLAN Overlay Topology

    ┌──────────────────────────────────────────────────────────────┐
    │                         GNS3 Topology                        │
    │                                                              │
    │                     ┌──────────────┐                         │
    │                     │    Switch    │  ← OpenVSwitch node     │
    │                     └──┬───┬───┬──┘                         │
    │              __________|   |   |__________                   │
    │             |               |             |                  │
    │       ┌─────┴──────┐  ┌─────┴──────┐  ┌──┴─────────┐       │
    │       │  Router 1  │  │  Router 2  │  │  Router 3  │       │
    │       │ (FRRouting)│  │ (FRRouting)│  │ (FRRouting)│       │
    │       │  eth0 / lo │  │  eth0 / lo │  │  eth0 / lo │       │
    │       └──────┬─────┘  └──────┬─────┘  └──────┬─────┘       │
    │              │                │                │             │
    │       ┌──────┴──┐      ┌──────┴──┐      ┌──────┴──┐        │
    │       │  Host 1 │      │  Host 2 │      │  Host 3 │        │
    │       │ Alpine  │      │ Alpine  │      │ Alpine  │        │
    │       └─────────┘      └─────────┘      └─────────┘        │
    └──────────────────────────────────────────────────────────────┘

- The **switch** is an OpenVSwitch node in GNS3 connecting all routers on the underlay.
- Each **router** is a Docker container running FRRouting.
- Each **host** is an Alpine container connected to its router's `eth1`/bridge interface.
- The **underlay network** (router ↔ switch) uses the `11.11.11.0/24` subnet.
- The **host-facing network** uses the `12.12.12.0/24` subnet, bridged across VXLAN.

| Layer | Technology | Role |
|---|---|---|
| **Underlay** | Static routes or OSPF | Provides routed connectivity between VTEPs via the switch |
| **Overlay** | VXLAN (UDP port 4789) | Carries Layer 2 frames across the Layer 3 underlay |
| **Control Plane (P2)** | Flood-and-learn | Static remote VTEP list, MAC learning by flooding |
| **Control Plane (P3)** | BGP EVPN | Distributes MAC/IP reachability dynamically, no flooding |

---

# Walkthrough

## :one: Part 1 — Setting Up GNS3 and Basic Connectivity

Install GNS3 and the GNS3 VM, which provides a nested virtualization environment for Docker-based nodes. Pull the required Docker images:

    docker pull frrouting/frr:latest
    docker pull alpine:latest

In GNS3, add the FRR image as a Docker appliance and create a minimal topology: one FRR router node linked to one Alpine host. Each FRR router node has a terminal accessible directly from GNS3.

### Configuring Interfaces in GNS3

GNS3 provides virtual ethernet interfaces to each Docker container based on how links are drawn in the topology canvas. When a link is drawn between the FRRouting router node and the switch, GNS3 automatically presents that as `eth0` inside the container.

The **IP configuration of `eth0`** (the underlay interface connecting each router to the switch) is set in the GNS3 node configuration — either through the startup config file embedded in the appliance definition, or by editing the node's configuration directly in GNS3. This is applied at node startup by the FRRouting `docker-start` process loading its config.

Example GNS3 startup config for a router node:

    # /etc/frr/frr.conf (embedded in GNS3 node config)
    frr version 9.x
    frr defaults traditional
    hostname router1
    !
    interface eth0
     ip address 11.11.11.1/24
    !
    interface lo
     ip address 1.1.1.1/32
    !
    ip route 0.0.0.0/0 11.11.11.254
    !
    line vty
    !

Verify FRR is running and interfaces are up:

    # Inside a GNS3 FRR node terminal
    $ vtysh
    Router# show interface eth0
    Interface eth0 is up, line protocol is up
      inet 11.11.11.1/24

    Router# ping 11.11.11.2
    !!!!!

At this stage, all routers can reach each other across the switch via the `11.11.11.0/24` underlay. The hosts are not yet connected — that comes in Part 2.

---

## :two: Part 2 — VXLAN Overlay with Flood-and-Learn

In Part 2, each router becomes a **VTEP** (VXLAN Tunnel Endpoint). VXLAN encapsulates Layer 2 Ethernet frames inside UDP/IP packets, extending a virtual L2 segment (`12.12.12.0/24`) across the `11.11.11.0/24` underlay.

### Why a Separate Setup Script?

The `eth0` underlay interface is owned and configured by FRRouting via its startup config (as shown above). However, **VXLAN and bridge interfaces are pure Linux kernel constructs** — they are not managed by FRRouting daemons. They must exist and be up **before** FRRouting's `docker-start` script launches the daemons, otherwise FRRouting cannot bind to the bridge or the VXLAN link.

The solution: write a shell script and wire it into the **Docker `ENTRYPOINT`** so it runs first, sets up VXLAN/bridge, and then calls `docker-start` to hand off to FRRouting.

### Dockerfile

    FROM frrouting/frr:latest

    COPY setup.sh /usr/local/bin/setup.sh
    RUN chmod +x /usr/local/bin/setup.sh

    # Run our setup script first, then hand off to FRR's docker-start
    ENTRYPOINT ["/usr/local/bin/setup.sh"]

### setup.sh — VXLAN and Bridge Setup Script

This script runs inside the container at startup. It reads environment variables (or hardcoded values) to know the local VTEP IP and the list of remote VTEPs. It creates the VXLAN interface, builds the bridge, enslaves both the VXLAN interface and the host-facing `eth1`, and then calls `docker-start` to launch FRRouting normally.

    #!/bin/sh
    set -e

    # --- Configuration ---
    # These match the loopback IPs assigned in the GNS3/FRR startup config
    LOCAL_VTEP_IP="1.1.1.1"         # this router's loopback (VTEP source IP)
    REMOTE_VTEP_IPS="2.2.2.2 3.3.3.3"  # peer VTEPs (flood-and-learn: static list)
    VNI=10
    BRIDGE="br0"
    VXLAN_IFACE="vxlan10"
    HOST_IFACE="eth1"               # GNS3 presents the host link as eth1

    # --- Create the VXLAN interface ---
    ip link add "${VXLAN_IFACE}" type vxlan \
        id "${VNI}" \
        dstport 4789 \
        local "${LOCAL_VTEP_IP}" \
        nolearning    # in Part 3 this suppresses local learning; BGP EVPN handles it

    # In flood-and-learn mode, add each remote VTEP as a static FDB entry
    for REMOTE in ${REMOTE_VTEP_IPS}; do
        bridge fdb append 00:00:00:00:00:00 dev "${VXLAN_IFACE}" dst "${REMOTE}"
    done

    ip link set "${VXLAN_IFACE}" up

    # --- Create the bridge and attach interfaces ---
    ip link add "${BRIDGE}" type bridge
    ip link set "${VXLAN_IFACE}" master "${BRIDGE}"
    ip link set "${HOST_IFACE}" master "${BRIDGE}"   # eth1 faces the Alpine host
    ip link set "${BRIDGE}" up

    # Assign a gateway IP on the bridge for the host subnet
    ip addr add 12.12.12.254/24 dev "${BRIDGE}"

    echo "[setup.sh] VXLAN ${VXLAN_IFACE} and bridge ${BRIDGE} are up."

    # --- Hand off to FRRouting's normal startup ---
    exec /sbin/docker-start

Because `exec /sbin/docker-start` replaces the shell process, FRRouting takes over as PID 1 of the container once the network interfaces are ready.

### Host Configuration

Each Alpine host gets an IP in the `12.12.12.0/24` range and points its default gateway at the router's bridge IP:

    # On Host 1 (Alpine container in GNS3)
    / # ip addr add 12.12.12.1/24 dev eth0
    / # ip route add default via 12.12.12.254

Ping between hosts traverses the VXLAN tunnel:

    # From Host 1
    / # ping 12.12.12.2
    64 bytes from 12.12.12.2: seq=0 ttl=64 time=2.1 ms

In flood-and-learn mode, the first packet to an unknown MAC is flooded to all remote VTEPs in the static FDB. Once the MAC is learned from the reply, subsequent traffic is unicast directly.

---

## :three: Part 3 — Replacing Flood-and-Learn with BGP EVPN

In Part 2, each VTEP needs a hardcoded list of all remote VTEPs, and MAC addresses are learned by flooding. In large fabrics this is untenable. **BGP EVPN** fixes both problems:

- **Type-3 IMET routes** advertise which VNIs a VTEP participates in, replacing the static FDB entries.
- **Type-2 MAC/IP routes** distribute learned MAC and IP addresses as BGP routes, replacing the flood-and-learn data plane.

The VXLAN and bridge setup script from Part 2 remains unchanged — the kernel interfaces are identical. Only the FRRouting configuration changes to add BGP and EVPN.

### Updated setup.sh for Part 3

The script is nearly identical, but the `nolearning` flag now plays a different role: it tells the kernel **not** to learn MACs from the data plane, since BGP EVPN will populate the FDB via the control plane instead. The static FDB flood entries are no longer needed and are removed:

    #!/bin/sh
    set -e

    LOCAL_VTEP_IP="1.1.1.1"
    VNI=10
    BRIDGE="br0"
    VXLAN_IFACE="vxlan10"
    HOST_IFACE="eth1"

    ip link add "${VXLAN_IFACE}" type vxlan \
        id "${VNI}" \
        dstport 4789 \
        local "${LOCAL_VTEP_IP}" \
        nolearning    # BGP EVPN owns the FDB now — no kernel MAC learning

    ip link set "${VXLAN_IFACE}" up

    ip link add "${BRIDGE}" type bridge
    # Disable MAC learning on the bridge as well — BGP EVPN handles it
    ip link set "${BRIDGE}" type bridge ageing 0
    ip link set "${VXLAN_IFACE}" master "${BRIDGE}"
    ip link set "${HOST_IFACE}" master "${BRIDGE}"
    ip link set "${BRIDGE}" up

    ip addr add 12.12.12.254/24 dev "${BRIDGE}"

    echo "[setup.sh] VXLAN and bridge ready. Handing off to FRRouting."
    exec /sbin/docker-start

### FRRouting BGP EVPN Configuration

With the kernel interfaces set up by the script, configure FRRouting via its GNS3 startup config (or via `vtysh`) to enable BGP and the `l2vpn evpn` address family.

One router acts as the **Route Reflector** — it has iBGP sessions with all leaf routers and redistributes EVPN routes among them. The others are leaves:

**Route Reflector (e.g., Router 1, ASN 65000):**

    router bgp 65000
     bgp router-id 1.1.1.1
     no bgp default ipv4-unicast
     !
     neighbor 2.2.2.2 remote-as 65000
     neighbor 2.2.2.2 update-source lo
     neighbor 3.3.3.3 remote-as 65000
     neighbor 3.3.3.3 update-source lo
     !
     address-family l2vpn evpn
      neighbor 2.2.2.2 activate
      neighbor 3.3.3.3 activate
      neighbor 2.2.2.2 route-reflector-client
      neighbor 3.3.3.3 route-reflector-client
     exit-address-family

**Leaf Router (e.g., Router 2, ASN 65000):**

    router bgp 65000
     bgp router-id 2.2.2.2
     no bgp default ipv4-unicast
     !
     neighbor 1.1.1.1 remote-as 65000    ! toward Route Reflector
     neighbor 1.1.1.1 update-source lo
     !
     address-family l2vpn evpn
      neighbor 1.1.1.1 activate
      advertise-all-vni    ! advertise all locally configured VNIs
     exit-address-family

`advertise-all-vni` tells FRRouting to scan the kernel for VXLAN interfaces (which already exist, thanks to the setup script), and automatically generate BGP EVPN Type-2 and Type-3 routes for each VNI it finds.

### Verification

    # BGP session state — all neighbors should be Established
    Router# show bgp summary
    Neighbor   AS      State/PfxRcd
    1.1.1.1    65000   Established/4

    # EVPN route table — Type-2 (MAC/IP) and Type-3 (IMET) routes
    Router# show bgp l2vpn evpn
    Route Distinguisher: 2.2.2.2:10
       *> [2]:[0]:[48]:[aa:bb:cc:dd:ee:ff]   MAC/IP Advertisement
       *> [3]:[0]:[32]:[2.2.2.2]              IMET (Inclusive Multicast)

    # Kernel FDB should show remote MACs learned via BGP, not by flooding
    Router# show evpn mac vni 10
    VNI 10
    MAC               Remote VTEP        State
    aa:bb:cc:dd:ee:ff 3.3.3.3            remote (BGP)

    # End-to-end ping across the fabric
    Host1# ping 12.12.12.2
    64 bytes from 12.12.12.2: seq=0 ttl=64 time=1.8 ms

    # Confirm no BUM flooding — traffic is unicast from the first packet
    Router# show vxlan fdb

---

# Questions and Answers

:question: What is an Autonomous System (AS)?

> An Autonomous System is a collection of IP routing prefixes under the administrative control of one or more network operators that presents a **single, coherent routing policy** to the rest of the internet. Each AS is identified by a globally unique **Autonomous System Number (ASN)** assigned by IANA or a Regional Internet Registry (RIR). BGP is the interdomain routing protocol that exchanges reachability information between ASes. ASNs can be 16-bit (1–65535) or 32-bit (up to ~4.3 billion), with 64512–65535 reserved for private use.

:question: What is the difference between iBGP and eBGP?

> **eBGP (External BGP)** sessions are formed between routers in **different** Autonomous Systems. The TTL of eBGP packets is 1 by default, meaning peers must typically be directly connected. **iBGP (Internal BGP)** sessions are formed between routers **within the same** AS to propagate externally learned routes across the AS. A critical iBGP rule is the **split-horizon rule**: routes learned from one iBGP peer cannot be re-advertised to another iBGP peer. This is solved by either a **full-mesh** iBGP topology or a **Route Reflector** (one router redistributes routes to all iBGP clients, as used in this project).

:question: Why are VXLAN and bridge interfaces configured in a script rather than by FRRouting?

> FRRouting manages routing protocol state and updates the kernel routing table, but it does not create arbitrary Linux network interfaces. VXLAN tunnel interfaces (`ip link add ... type vxlan`) and bridge interfaces (`ip link add ... type bridge`) are pure Linux kernel constructs. They must be created and brought up **before** the FRRouting daemons start — otherwise, FRRouting cannot reference them in its config. By running a setup script as the Docker `ENTRYPOINT` (before calling `docker-start`), we guarantee the kernel interfaces are ready when FRRouting initializes.

:question: Why does GNS3 handle `eth0` but not the VXLAN interfaces?

> GNS3 presents virtual ethernet interfaces to Docker containers based on the links drawn in the topology canvas. When you connect a router node to the switch in GNS3, it wires a veth pair into the container and presents it as `eth0`. GNS3 knows nothing about VXLAN or bridge interfaces — those are overlay constructs that exist logically above the underlay. The underlay (`eth0`, `11.11.11.0/24`) is GNS3's job; the overlay (VXLAN, bridge, `12.12.12.0/24`) is the application's job.

:question: What is VXLAN and why is it needed in modern data centers?

> VXLAN (Virtual Extensible LAN, RFC 7348) is a network overlay protocol that encapsulates Layer 2 Ethernet frames inside Layer 3 UDP packets (port 4789). It was created to overcome the VLAN limitation of 4096 unique segments — VXLAN uses a 24-bit VNI (VXLAN Network Identifier), allowing over 16 million virtual segments. In modern data centers with thousands of tenants and containers, this scale is essential. VXLAN allows Layer 2 adjacency to be extended across a routed Layer 3 underlay — a technique called an **overlay network**.

:question: What is BGP EVPN and why is it used with VXLAN?

> BGP EVPN (Ethernet VPN, RFC 7432 + RFC 8365) is an address family extension to BGP that carries MAC address and IP reachability information as BGP routes. When combined with VXLAN, it replaces the traditional **flood-and-learn** mechanism (where unknown MACs are flooded to all VTEPs) with a **control-plane-driven** approach. Each VTEP advertises its locally learned MAC/IP bindings via BGP EVPN Type-2 routes, and VTEP membership via Type-3 IMET routes. This eliminates BUM (Broadcast, Unknown unicast, Multicast) flooding, dramatically reducing unnecessary traffic in large fabrics.

:question: What is a VTEP and what role does it play?

> A VTEP (VXLAN Tunnel Endpoint) is a network device (physical or virtual) that originates and terminates VXLAN tunnels. On the sending side, it encapsulates an Ethernet frame with a VXLAN header (containing the VNI), a UDP header (port 4789), and an outer IP header (using the VTEP's loopback IP as source). On the receiving side, it strips the outer headers and delivers the original Ethernet frame to the local bridge. In this project, each FRRouting router acts as a VTEP.

:question: What are BGP EVPN route types?

> BGP EVPN defines several route types. **Type 1 (Ethernet Auto-Discovery)**: used for multi-homing fast convergence. **Type 2 (MAC/IP Advertisement)**: carries a specific MAC address and optionally its associated IP address, allowing VTEPs to learn remote MAC-to-VTEP mappings without flooding. **Type 3 (Inclusive Multicast Ethernet Tag / IMET)**: advertises a VTEP's participation in a VNI, replacing the static FDB flood entries from Part 2. **Type 5 (IP Prefix Route)**: carries IP prefixes for inter-subnet routing. Types 2 and 3 are what `advertise-all-vni` generates automatically.

:question: What is `advertise-all-vni` in FRRouting?

> `advertise-all-vni` is an FRRouting BGP EVPN directive that tells the daemon to automatically discover all VXLAN interfaces present in the kernel (those created by the setup script) and generate the corresponding BGP EVPN routes (Type-2 and Type-3) for each VNI. Without it, you would have to manually configure each VNI under the `address-family l2vpn evpn` stanza. It only works because the VXLAN interfaces already exist when FRRouting starts — another reason the setup script must run first.

# Resources

* BGP RFC 4271 : https://www.rfc-editor.org/rfc/rfc4271
* VXLAN RFC 7348 : https://www.rfc-editor.org/rfc/rfc7348
* BGP EVPN RFC 7432 : https://www.rfc-editor.org/rfc/rfc7432
* FRRouting BGP Documentation : https://docs.frrouting.org/en/latest/bgp.html
* FRRouting EVPN Documentation : https://docs.frrouting.org/en/latest/evpn.html
* VXLAN BGP EVPN Deep Dive : https://vincent.bernat.ch/en/blog/2017-vxlan-bgp-evpn
* GNS3 Documentation : https://docs.gns3.com/
* Cumulus Networks EVPN Guide : https://docs.nvidia.com/networking-ethernet-software/cumulus-linux/Network-Virtualization/Ethernet-Virtual-Private-Network-EVPN/
