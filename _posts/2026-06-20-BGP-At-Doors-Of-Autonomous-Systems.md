---
title: BGP - At Doors of Autonomous Systems
date: 2026-06-20 11:00:00 +0100
categories: [Networking, Routing, Infrastructure]
tags: [BGP, VXLAN, GNS3, FRRouting, Networking]
render_with_liquid: false
---

# Introduction :

Border Gateway Protocol (BGP) is the routing protocol that holds the internet together. It is the "postal service" of the internet — when data is submitted, BGP is responsible for looking at all available paths and picking the best route. It is the only protocol designed to deal with a network of the internet's size and is the only protocol that can handle the large number of Autonomous Systems (AS) on the internet.

# Project goals :

BGP At Doors of Autonomous Systems is a 1337 project focused on network virtualization and dynamic routing. The goal is to build a virtual network infrastructure using GNS3, configure BGP and VXLAN overlays with FRRouting (FRR), and understand how large-scale internet routing works through hands-on simulation.

# Walkthrough :

:one: Setting up the virtual environment (GNS3) :

Install GNS3 and pull the required Docker images for the project routers and hosts. The topology consists of routers running FRRouting and simple Alpine Linux hosts connected to simulate a real-world network.

    docker pull frrouting/frr:latest
    docker pull alpine:latest

:two: Configuring VXLAN overlays :

VXLAN (Virtual Extensible LAN) encapsulates Layer 2 Ethernet frames over a Layer 3 UDP network. Configure VXLAN tunnels on the leaf routers to create a virtual overlay network that stretches across different routing domains.

    ip link add vxlan10 type vxlan id 10 dstport 4789 local 10.1.1.1 nolearning
    ip link set vxlan10 up
    brctl addbr br10
    brctl addif br10 vxlan10
    ip link set br10 up

:three: Configuring BGP with FRRouting :

Enter the FRR `vtysh` shell and configure BGP on each router. Define the Autonomous System number and advertise the relevant networks. Use BGP EVPN (Ethernet VPN) address family to distribute MAC and IP reachability information across the VXLAN fabric.

    router bgp 65001
      bgp router-id 1.1.1.1
      neighbor 10.0.0.2 remote-as 65002
      !
      address-family l2vpn evpn
        neighbor 10.0.0.2 activate
        advertise-all-vni
      exit-address-family

:four: Verifying BGP sessions and routes :

Use `vtysh` commands to inspect BGP neighbor states, learned routes, and EVPN table entries. A successful setup shows all neighbors in the `Established` state and EVPN type-2 (MAC/IP) and type-3 (Inclusive Multicast) routes being exchanged.

    show bgp summary
    show bgp l2vpn evpn
    show bgp l2vpn evpn route type macip

:five: Testing end-to-end connectivity :

From a host in one VXLAN segment, ping a host in another segment on a different router. Successful replies confirm that the BGP EVPN control plane is correctly distributing MAC reachability and that VXLAN is properly encapsulating and forwarding traffic across the underlay network.

    / # ping 192.168.1.20
    PING 192.168.1.20 (192.168.1.20): 56 data bytes
    64 bytes from 192.168.1.20: seq=0 ttl=64 time=1.2 ms

# Questions and answers

:question: What is an Autonomous System (AS)?

> An Autonomous System is a collection of IP routing prefixes under the control of one or more network operators that presents a common and clearly defined routing policy to the internet. Each AS is assigned a unique Autonomous System Number (ASN) by an internet registry. BGP is the protocol used by these ASes to exchange routing information with each other.

:question: What is the difference between iBGP and eBGP?

> eBGP (External BGP) is used between routers in *different* Autonomous Systems to exchange routes across the internet. iBGP (Internal BGP) is used between routers *within the same* Autonomous System to ensure consistent routing information inside the AS. A key rule of iBGP is that routes learned from one iBGP peer cannot be re-advertised to another iBGP peer (to prevent routing loops), which is solved using either a full-mesh topology or a Route Reflector.

:question: What is BGP EVPN and why is it used with VXLAN?

> BGP EVPN (Ethernet VPN) is an extension to BGP that carries MAC address and IP reachability information (traditionally a Layer 2 concern) as BGP routes. When used with VXLAN, it replaces the traditional flood-and-learn mechanism with a control-plane-driven approach: instead of flooding unknown traffic, routers advertise their locally learned MAC/IP bindings via BGP EVPN, so all peers know exactly which VTEP (VXLAN Tunnel Endpoint) to send traffic to. This results in a more scalable, efficient, and loop-free overlay network.

# Ressources :

* BGP RFC 4271 : https://www.rfc-editor.org/rfc/rfc4271
* FRRouting BGP Documentation : https://docs.frrouting.org/en/latest/bgp.html
* VXLAN BGP EVPN Explained : https://vincent.bernat.ch/en/blog/2017-vxlan-bgp-evpn
* GNS3 Documentation : https://docs.gns3.com/
