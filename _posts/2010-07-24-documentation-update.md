---
id: 122
title: Documentation Update
date: 2010-07-24 09:42:56 -0500
author: William Bittle
layout: post
guid: http://www.dyn4j.org/?p=122
permalink: /2010/07/documentation-update/
categories:
  - News
---
The latest version (1.0.3) has newly added documentation. Namely references to the open source project <a onclick="javascript:pageTracker._trackPageview('/outgoing/www.box2d.org');"  href="http://www.box2d.org">Box2d</a> that I meant to have in before the first release. The @since and @version tags were also added so that differences in API versions are documented.

As a side note, performance was improved slightly by a few code changes in a hot spot method on the Polygon class called getFarthestPoint. This yielded a double digit FPS increase in the TestBed on the Bucket test.

The next phase of the project is to improve the ContactConstraintSolver. Box2d has a nice feature of a blockwise solver for contact manifolds with 2 points (since 2D only has 1 or 2 points in contact manifold). This could allow for much more stable stacking.

Along with this I have plans to create some tutorials on the methods used to create joints on by [blog](http://www.dyn4j.org/category/blog/). Beware as it will contain a good bit of math.