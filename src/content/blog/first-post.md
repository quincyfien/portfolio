---
title: "What I Learned Building Circuit Forge"
date: "2026-06-15"
category: "Web Development"
tags: ["Django", "Python", "E-commerce", "Docker"]
summary: "An engineering post-mortem detailing how I solved the hardware compatibility check matrix and designed transactional checkout logic using Django and PostgreSQL."
readTime: "5 min read"
---

### The Vision
Circuit Forge was born out of a desire to build a niche e-commerce platform where users could design their own custom PC builds and have them assembled, tested, and optimized. Unlike standard e-commerce stores that sell standalone components, a PC builder must address a fundamental engineering hurdle: **compatibility**.

### The Compatibility Matrix
A motherboard has a specific socket type (e.g., LGA1700, AM5). If a user selects a CPU with an AM4 socket and a motherboard with an LGA1700 socket, they will receive components they cannot build. To prevent this, I designed a compatibility validation layer.

Here's a snippet of how I structured the Django models to handle the compatibility logic:

```python
class Motherboard(models.Model):
    name = models.CharField(max_length=200)
    socket_type = models.CharField(max_length=50) # e.g., 'AM5'
    ram_slots = models.IntegerField()
    max_memory_gb = models.IntegerField()
    form_factor = models.CharField(max_length=50) # e.g., 'ATX'

class CPU(models.Model):
    name = models.CharField(max_length=200)
    socket_type = models.CharField(max_length=50) # e.g., 'AM5'
    tdp_watts = models.IntegerField()
```

When a user adds a CPU or Motherboard to their PC build configuration, an AJAX request evaluates the intersection of properties.

### Major Challenges & Solutions
1. **The N+1 Query Problem**: Checking compatibilities across multiple items in the cart originally led to dozens of SQL calls. I resolved this by utilizing Django's `.select_related()` and caching compatibility results in Redis.
2. **Containerization with Docker**: Containerizing local PostgreSQL and Gunicorn alongside Django ensured development mirrored production settings closely.

### Key Takeaways
- Relational databases are highly effective for mapping complex compatibility parameters.
- Optimizing database queries early in development prevents significant latency under high cart load.
- Containerization with Docker makes setting up environment configurations seamless and reproducible.
