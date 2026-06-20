---
title: BGP - At Doors of Autonomous Systems
date: 2026-06-20 11:00:00 +0100
categories: [Networking, Routing, Infrastructure]
tags: [BGP, VXLAN, GNS3, FRRouting, Networking, EVPN, Underlay, Overlay]
render_with_liquid: false
---

# Introduction :

Border Gateway Protocol (BGP) is the routing protocol that holds the internet together. It is the only protocol designed to exchange routing information between independently administered networks — called Autonomous Systems (AS) — at internet scale. While interior routing protocols like OSPF or EIGRP manage routes within a single organization's network, BGP manages routes **between** organizations, ISPs, and data centers. Every time you visit a website, BGP is what ensures your packets take a valid path across the dozens of networks between you and the server.

# Project goals :

BGP At Doors of Autonomous Systems is a 1337 project focused on network virtualization and dynamic routing. The project is divided into two parts:
- **Part 1**: Build a simple GNS3 topology with VXLAN tunnels to understand the overlay/underlay concept.
- **Part 2**: Replace the flood-and-learn VXLAN control plane with a BGP EVPN control plane using FRRouting, simulating a modern data center fabric.

# Network Architecture Overview :

    ┌──────────────────────────────────────────────────────────────────┐
    │                       BGP EVPN Fabric                            │
    │                                                                  │
    │          ┌────────────┐        ┌────────────┐                    │
    │          │  Spine 1   │        │  Spine 2   │  ← Route Reflectors│
    │          │ ASN 65000  │        │ ASN 65000  │                    │
    │          └─────┬──────┘        └─────┬──────┘                    │
    │                │ eBGP               │ eBGP                       │
    │       ┌────────┴────┐         ┌─────┴───────┐                   │
    │       │   Leaf 1    │  VXLAN  │   Leaf 2    │  ← VTEPs           │
    │       │  ASN 65001  │◄───────►│  ASN 65002  │                   │
    │       └──────┬──────┘         └──────┬──────┘                   │
    │              │                        │                          │
    │         ┌────┴────┐             ┌─────┴────┐                    │
    │         │  Host A  │             │  Host B  │                    │
    │         │10.0.0.1  │             │10.0.0.2  │                    │
    │         └─────────┘             └──────────┘                    │
    └──────────────────────────────────────────────────────────────────┘

| Layer | Technology | Role |
|---|---|---|
| **Underlay** | IP routing (OSPF or static) | Provides routed connectivity between VTEPs |
| **Overlay** | VXLAN (UDP port 4789) | Carries Layer 2 frames across the Layer 3 underlay |
| **Control Plane** | BGP EVPN | Distributes MAC/IP reachability instead of flooding |

# Walkthrough :

:one: Setting up the GNS3 Virtual Lab :

Install GNS3 and the GNS3 VM (which provides a nested virtualization environment for Docker-based nodes). Pull the required Docker images:

    docker pull frrouting/frr:latest
    docker pull alpine:latest

In GNS3, add the FRR image as a Docker appliance and create your topology by dragging nodes onto the canvas and drawing links between them. Each FRR router node will have a terminal accessible directly from GNS3.

Verify FRR is running inside a router node:

    # Inside a GNS3 FRR node terminal
    $ vtysh
    Router# show version
    FRRouting 9.x (hostname) on Linux

:two: Configuring the Underlay (IP Connectivity Between VTEPs) :

Before VXLAN can work, the VTEP (VXLAN Tunnel Endpoint) router loopback addresses must be reachable from each other across the underlay. Use OSPF or simple static routes depending on the topology:

    # Configure loopback on Leaf 1 (used as VTEP source IP)
    Router# configure terminal
    Router(config)# interface lo
    Router(config-if)# ip address 1.1.1.1/32
    Router(config-if)# exit

    # Configure interface toward Spine
    Router(config)# interface eth0
    Router(config-if)# ip address 10.0.12.1/30
    Router(config-if)# exit

    # Enable OSPF for underlay reachability
    Router(config)# router ospf
    Router(config-router)# network 0.0.0.0/0 area 0
    Router(config-router)# exit

Verify underlay connectivity:

    Router# ping 2.2.2.2 source 1.1.1.1
    !!!!!

:three: Configuring VXLAN Tunnels (Part 1 — Flood and Learn) :

VXLAN encapsulates Layer 2 Ethernet frames inside UDP packets. On each leaf router (acting as a VTEP), create a VXLAN interface for each L2 segment (VNI) and bridge it:

    # On Leaf 1 — create VXLAN interface for VNI 10
    ip link add vxlan10 type vxlan \
      id 10 \
      dstport 4789 \
      local 1.1.1.1 \
      remote 2.2.2.2 \    # peer VTEP (flood-and-learn uses static remote)
      nolearning

    ip link set vxlan10 up

    # Bridge the VXLAN interface with the local host-facing interface
    ip link add br10 type bridge
    ip link set vxlan10 master br10
    ip link set eth1 master br10         # eth1 faces Host A
    ip link set br10 up

    # Assign a gateway IP to the bridge for L3 routing
    ip addr add 192.168.1.1/24 dev br10

:four: Replacing Flood-and-Learn with BGP EVPN (Part 2) :

In Part 1, each VTEP needs a static list of all remote VTEPs. BGP EVPN eliminates this by dynamically distributing MAC/IP bindings and VTEP membership through BGP. Configure each leaf with `advertise-all-vni` and point neighbors to the spine as a Route Reflector:

    # vtysh on Leaf 1
    Router# configure terminal

    Router(config)# router bgp 65001
    Router(config-router)# bgp router-id 1.1.1.1
    Router(config-router)# no bgp default ipv4-unicast
    Router(config-router)# neighbor 10.0.12.2 remote-as 65000    ! toward Spine
    Router(config-router)# neighbor 10.0.12.2 update-source lo
    Router(config-router)# !
    Router(config-router)# address-family l2vpn evpn
    Router(config-router-af)#   neighbor 10.0.12.2 activate
    Router(config-router-af)#   advertise-all-vni
    Router(config-router-af)# exit-address-family
    Router(config-router)# exit

    # vtysh on Spine (Route Reflector)
    Router(config)# router bgp 65000
    Router(config-router)# bgp router-id 10.10.10.10
    Router(config-router)# neighbor 10.0.12.1 remote-as 65001
    Router(config-router)# neighbor 10.0.23.1 remote-as 65002
    Router(config-router)# !
    Router(config-router)# address-family l2vpn evpn
    Router(config-router-af)#   neighbor 10.0.12.1 activate
    Router(config-router-af)#   neighbor 10.0.23.1 activate
    Router(config-router-af)#   neighbor 10.0.12.1 route-reflector-client
    Router(config-router-af)#   neighbor 10.0.23.1 route-reflector-client
    Router(config-router-af)# exit-address-family

:five: Verifying BGP Sessions and EVPN Routes :

Use `vtysh` to inspect the BGP neighbor state and EVPN route table. All neighbors should be in `Established` state and EVPN Type-2 (MAC/IP) and Type-3 (IMET — Inclusive Multicast Ethernet Tag) routes should be visible:

    Router# show bgp summary
    Neighbor   AS      MsgRcvd MsgSent   State/PfxRcd
    10.0.12.2  65000   150     145       Established/3

    Router# show bgp l2vpn evpn
    BGP table version is 6, local router ID is 1.1.1.1
    Route Distinguisher: 1.1.1.1:10
       *> [2]:[0]:[48]:[aa:bb:cc:dd:ee:ff]   (MAC/IP route — Type 2)
       *> [3]:[0]:[32]:[1.1.1.1]              (IMET route — Type 3)

    Router# show bgp l2vpn evpn route type macip
    Router# show vxlan fdb                    # forwarding database
    Router# show evpn vni                     # VNI state

:six: End-to-End Connectivity Testing :

From Host A (connected to Leaf 1), ping Host B (connected to Leaf 2). The VXLAN encapsulation and BGP EVPN control plane handle the forwarding transparently:

    # On Host A (Alpine Linux container in GNS3)
    / # ip addr add 192.168.1.10/24 dev eth0
    / # ip route add default via 192.168.1.1

    # On Host B
    / # ip addr add 192.168.1.20/24 dev eth0

    # From Host A
    / # ping 192.168.1.20
    PING 192.168.1.20 (192.168.1.20): 56 data bytes
    64 bytes from 192.168.1.20: seq=0 ttl=64 time=1.4 ms
    64 bytes from 192.168.1.20: seq=1 ttl=64 time=0.9 ms

    # Confirm that the MAC was learned via BGP, not by flooding:
    Router# show evpn mac vni 10
    VNI 10
    MAC               Intf/Remote VTEP         State   Seq #'s
    aa:bb:cc:dd:ee:ff 2.2.2.2                  remote  0/0

# Questions and answers

:question: What is an Autonomous System (AS)?

> An Autonomous System is a collection of IP routing prefixes under the administrative control of one or more network operators that presents a **single, coherent routing policy** to the rest of the internet. Each AS is identified by a globally unique **Autonomous System Number (ASN)** assigned by IANA or a Regional Internet Registry (RIR). BGP is the interdomain routing protocol that exchanges reachability information between ASes. ASNs can be 16-bit (1–65535) or 32-bit (up to ~4.3 billion), with 64512–65535 reserved for private use.

:question: What is the difference between iBGP and eBGP?

> **eBGP (External BGP)** sessions are formed between routers in **different** Autonomous Systems. The TTL of eBGP packets is 1 by default, meaning peers must typically be directly connected. **iBGP (Internal BGP)** sessions are formed between routers **within the same** AS to propagate externally learned routes across the AS. A critical iBGP rule is the **split-horizon rule**: routes learned from one iBGP peer cannot be re-advertised to another iBGP peer. This is solved by either a **full-mesh** iBGP topology (all routers peer with all others) or a **Route Reflector** (one router redistributes routes to all iBGP clients, as used in the Spine in this project).

:question: What is VXLAN and why is it needed in modern data centers?

> VXLAN (Virtual Extensible LAN, RFC 7348) is a network overlay protocol that encapsulates Layer 2 Ethernet frames inside Layer 3 UDP packets (port 4789). It was created to overcome the VLAN limitation of 4096 unique segments — VXLAN uses a 24-bit VNI (VXLAN Network Identifier), allowing over 16 million virtual segments. In modern data centers with thousands of tenants and containers, this scale is essential. VXLAN allows Layer 2 adjacency to be extended across a routed Layer 3 underlay — a technique called an **overlay network**.

:question: What is BGP EVPN and why is it used with VXLAN?

> BGP EVPN (Ethernet VPN, RFC 7432 + RFC 8365) is an address family extension to BGP that carries MAC address and IP reachability information as BGP routes. When combined with VXLAN, it replaces the traditional **flood-and-learn** mechanism (where unknown MACs are flooded to all VTEPs) with a **control-plane-driven** approach. Each VTEP advertises its locally learned MAC/IP bindings via BGP EVPN Type-2 routes, and VTEP membership via Type-3 IMET routes. This eliminates BUM (Broadcast, Unknown unicast, Multicast) flooding, dramatically reducing unnecessary traffic in large fabrics.

:question: What is a VTEP and what role does it play?

> A VTEP (VXLAN Tunnel Endpoint) is a network device (physical or virtual) that originates and terminates VXLAN tunnels. On the sending side, it encapsulates an Ethernet frame with a VXLAN header (containing the VNI), a UDP header (port 4789), and an outer IP header (using the VTEP's IP as source, and the remote VTEP's IP as destination). On the receiving side, it strips the outer headers and delivers the original Ethernet frame to the local bridge/segment. In this project, each FRR leaf router acts as a VTEP.

:question: What are BGP EVPN route types and what does each carry?

> BGP EVPN defines several route types. **Type 1 (Ethernet Auto-Discovery)**: used for multi-homing fast convergence. **Type 2 (MAC/IP Advertisement)**: carries a specific MAC address and optionally its associated IP address, allowing VTEPs to learn remote MAC-to-VTEP mappings without flooding. **Type 3 (Inclusive Multicast Ethernet Tag / IMET)**: advertises a VTEP's participation in a VNI, used to build the BUM flooding tree. **Type 5 (IP Prefix Route)**: carries IP prefixes for inter-subnet routing (L3 VPN). Types 2 and 3 are the most commonly used and are what this project configures via `advertise-all-vni`.

# Ressources :

* BGP RFC 4271 : https://www.rfc-editor.org/rfc/rfc4271
* VXLAN RFC 7348 : https://www.rfc-editor.org/rfc/rfc7348
* BGP EVPN RFC 7432 : https://www.rfc-editor.org/rfc/rfc7432
* FRRouting BGP Documentation : https://docs.frrouting.org/en/latest/bgp.html
* FRRouting EVPN Documentation : https://docs.frrouting.org/en/latest/evpn.html
* VXLAN BGP EVPN Deep Dive : https://vincent.bernat.ch/en/blog/2017-vxlan-bgp-evpn
* GNS3 Documentation : https://docs.gns3.com/
* Cumulus Networks EVPN Guide : https://docs.nvidia.com/networking-ethernet-software/cumulus-linux/Network-Virtualization/Ethernet-Virtual-Private-Network-EVPN/
