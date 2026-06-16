---
title: Snowcrash - Introduction to Cybersecurity and Privilege Escalation
date: 2024-04-10 10:00:00 +0100
categories: [Cybersecurity, System Administration, Reverse Engineering]
tags: [CTF, Privilege Escalation, Linux, SUID, Reverse Engineering]
render_with_liquid: false
---

# Introduction :

In Linux security models, privilege escalation occurs when an attacker exploits a bug, design flaw, or configuration oversight in an operating system or software application to gain elevated access to resources that are normally protected from an application or user.

# Project goals :

Snowcrash is a 1337 project based on a Capture The Flag (CTF) format. The objective is to navigate an intentionally vulnerable ISO image, discovering flags to progress through levels, ultimately escalating privileges from a low-level user to the root administrator.

# Walkthrough :

:one: Environment and Reconnaissance :

Mount the provided ISO in a virtualizer (like VirtualBox). Connect via SSH. Initial access is typically granted at level00. The first step in any level is to enumerate files, permissions, and running processes.

    ls -la
    find / -user flag00 2>/dev/null

:two: Analyzing SUID Binaries :

A common vulnerability vector is an executable file with the Set-User-ID (SUID) bit enabled. When executed, this file runs with the privileges of the file's owner, not the user executing it. If a binary owned by `flagXX` has the SUID bit set, vulnerabilities within that binary can execute commands as `flagXX`.

    find / -perm -4000 2>/dev/null

:three: Environment Variable Exploitation :

If an SUID binary calls a system command (e.g., `echo`) without specifying the absolute path (e.g., `/bin/echo`), the system searches the directories listed in the `$PATH` environment variable. By modifying the `$PATH` to point to a temporary directory containing a malicious script named `echo`, the SUID binary will execute the malicious script instead.

    export PATH=/tmp:$PATH
    echo "/bin/getflag" > /tmp/echo
    chmod +x /tmp/echo

:four: Analyzing Scripts and Cron Jobs :

Examine automated tasks running on the system. If a root-owned cron job executes a world-writable script, or parses user-controlled files without sanitization, malicious payloads can be injected to execute at the next cron interval.

:five: Basic Reverse Engineering :

Use `objdump` or `gdb` to inspect compiled binaries. Often, string comparisons (e.g., `strcmp`) against hardcoded passwords can be extracted by reading the binary's read-only data section or using `ltrace` to intercept library calls.

    ltrace ./suid_binary

# Questions and answers

:question: What is a Set-User-ID (SUID) bit?

> The SUID bit is a Linux file permission flag. When applied to an executable, it instructs the operating system to run the executable with the permissions of the file's owner, rather than the permissions of the user launching it.

:question: Why is using relative paths in scripts dangerous?

> If a script executes a command using a relative path, it relies on the `$PATH` variable to locate the binary. An attacker can manipulate the `$PATH` variable to redirect execution to a malicious executable of the same name, leading to unauthorized code execution.

:question: What does `2>/dev/null` do in bash commands?

> File descriptor 2 represents Standard Error (`stderr`). The syntax `2>/dev/null` redirects all error messages to `/dev/null` (a special file that discards all data written to it), preventing permission denied errors from cluttering the terminal output during searches.

# Ressources :

* Linux File Permissions : https://wiki.archlinux.org/title/File_permissions_and_attributes
* Privilege Escalation Techniques : https://payatu.com/blog/linux-privilege-escalation/
* GDB Documentation : https://sourceware.org/gdb/documentation/
