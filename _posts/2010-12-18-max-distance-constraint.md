---
id: 375
title: Max Distance Constraint
date: 2010-12-18T13:22:59-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=295
permalink: /2010/12/max-distance-constraint/
categories:
  - Blog
  - Constrained Dynamics
  - Game Development
  - Physics
tags:
  - Constrained Dynamics
  - Equality Constraints
  - Game Development
  - Physics
---
As a follow up post to the Distance Constraint post, we can also create a maximum distance constraint using the same solution we found in the Distance Constraint post.

The previous solution created a fixed length distance constraint which forced a pair of bodies to be a given length apart. We can simply add an if statement to make this constraint a max length constraint.

A max length constraint only specifies that the distance between the joined bodies does not exceed the given maximum. So before applying the fixed length distance constraint just check whether the bodies have separated past the maximum distance. If not, then do nothing. Simple!

```java
l = (pa - pb).getMagnitude();
if (l > maxDistance) {
  // apply constraint
}
// otherwise do not apply the constraint
```