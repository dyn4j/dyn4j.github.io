---
id: 439
title: The dyn4j TestBed Now Uses JOGL
date: 2011-02-05T14:31:35-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=367
permalink: /2011/02/the-dyn4j-testbed-now-uses-jogl/
categories:
  - Blog
  - Game Development
  - News
tags:
  - Game Development
  - Java
  - OpenGL
---
I recently released a new version of the TestBed application (which is used to test the [dyn4j](http://www.dyn4j.org/) project. In this new version I decided to move from Java2D to OpenGL.

There is a great open source project called <a onclick="javascript:pageTracker._trackPageview('/outgoing/www.jogamp.org');"  href="http://www.jogamp.org">JOGL</a> that makes the OpenGL API available to Java.

You can test out the new TestBed [here](http://www.dyn4j.org/TestBed/latest/dyn4j-TestBed.jnlp).

In addition to the full OpenGL API, JOGL also offers OO approaches to common tasks like texturing, shaders, etc. The project owners, after reviving JOGL and JOAL (thank you!!!) have also been working on a binding to OpenCL called JOCL. This seems very promising and hopefully I&#8217;ll have some time to actually look into using this to help speed up some bottlenecks in dyn4j.

As a side note, I do have to say that the OpenGL API is really good and pretty well documented. I had a few &#8220;scratch my head&#8221; moments but for the most part I&#8217;m really liking it.