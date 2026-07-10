---
title: "Setting Up Suricata IDS on Ubuntu"
date: "2026-06-22"
category: "Cybersecurity"
tags: ["Suricata", "IDS", "Networking", "Incident Response"]
summary: "A practical guide to installing, configuring, and testing Suricata Intrusion Detection System rules on an Ubuntu server to capture network scans."
readTime: "6 min read"
---

### Introduction
Suricata is a high-performance, open-source network analysis and threat detection engine. In this guide, we walk through setting up Suricata on Ubuntu, tuning its configuration, and writing custom signature rules to detect reconnaissance sweeps.

### Step 1: Installing Suricata
First, we add the official repository and install the package:

```bash
sudo add-apt-repository ppa:oisf/suricata-stable
sudo apt update
sudo apt install suricata -y
```

### Step 2: Selecting the Correct Network Interface
Configure Suricata to monitor the correct network interface. We locate the active interface with `ip a` (e.g., `eth0` or `enp0s3`) and edit the configuration:

```bash
sudo nano /etc/suricata/suricata.yaml
```

Under the `af-packet` section, verify the interface name matches:

```yaml
af-packet:
  - interface: enp0s3
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes
```

### Step 3: Writing Custom Detection Rules
Suricata relies on signature rules. Let's create a custom rule that flags potential stealth network scans by detecting incoming Nmap ping sweeps. We add this line to our local rule file `/var/lib/suricata/rules/local.rules`:

```text
alert icmp any any -> $HOME_NET any (msg:"NAMP Ping Sweep Detected"; itype:8; sid:1000001; rev:1;)
```

### Step 4: Activating & Testing the Rules
Verify configuration syntax and reload Suricata to apply the rules:

```bash
sudo suricata -T -c /etc/suricata/suricata.yaml
sudo systemctl restart suricata
```

From a separate machine, execute an ICMP ping command or run an Nmap ping scan against the server:

```bash
nmap -sn 192.168.1.50
```

Inspect the alert log to confirm detection:

```bash
tail -f /var/log/suricata/fast.log
```

### Conclusion
Deploying Suricata provides critical visibility into network traffic. The key to reducing alert fatigue lies in fine-tuning your rulesets and filtering out benign internal traffic patterns.
