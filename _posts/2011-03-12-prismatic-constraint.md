---
id: 440
title: Prismatic Constraint
date: 2011-03-12T18:52:03-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=375
permalink: /2011/03/prismatic-constraint/
zerif_testimonial_option:
  - ""
zerif_team_member_option:
  - ""
zerif_team_member_fb_option:
  - ""
zerif_team_member_tw_option:
  - ""
zerif_team_member_bh_option:
  - ""
zerif_team_member_db_option:
  - ""
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
The next equality constraint we will derive is the prismatic constraint. A prismatic constraint is like the line constraint except it does not allow rotation about the anchor point. A prismatic constraint constraints the linear motion of the bodies along a line. An example of a prismatic joint is the slide of a semi-automatic pistol. The slide is moved back to charge the weapon, then released to its original position. The slide cannot rotate about the pistol, nor can it move up/down or left/right only along one axis.  
<!--more-->

<a name="ptp-top"></a>

  1. [Problem Definition](#ptp-problem)
  2. [Process Overview](#ptp-process)
  3. [The Jacobian](#ptp-jacobian)
  4. [Compute The K Matrix](#ptp-kmatrix)

<a name="ptp-problem"></a>  
[Problem Definition](#ptp-top)  
It&#8217;s probably good to start with a good definition of what we are trying to accomplish.

We want to take two or more bodies and constrain their motion in some way. For instance, say we want two bodies to only be able to rotate about a common point (Revolute Joint). The most common application are constraints between pairs of bodies. Because we have constrained the motion of the bodies, we must find the correct velocities, so that constraints are satisfied otherwise the integrator would allow the bodies to move forward along their current paths. To do this we need to create equations that allow us to solve for the velocities.

What follows is the derivation of the equations needed to solve for a Prismatic constraint.  
<a name="ptp-process"></a>  
[Process Overview](#ptp-top)  
Let&#8217;s review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find J, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the K matrix. The K matrix is the A in the Ax = b general form equation.  
<a name="ptp-jacobian"></a>  
[The Jacobian](#ptp-top)  
As earlier stated, the Prismatic Joint is just like the Line Joint only it does not allow rotation about the anchor point. Because of this, we can formulate the Prismatic Joint by combining two joints: Line Joint and Angle Joint. This allows us to skip directly to the Jacobian:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/03/prismaticc-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-2.png"><img loading="lazy" class="alignnone size-full wp-image-699" src="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-2.png" alt="prismaticc (2)" width="412" height="63" srcset="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-2.png 412w, http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-2-300x46.png 300w" sizes="(max-width: 412px) 100vw, 412px" /></a>

> See the &#8220;Line Constraint&#8221; and &#8220;Angle Constraint&#8221; posts for the derivation of their Jacobians.

<a name="ptp-kmatrix"></a>  
[Compute The K Matrix](#ptp-top)  
Lastly, to solve the constraint we need to compute the values for A (I use the name K) and b:

> See the &#8220;Equality Constraints&#8221; post for the derivation of the A matrix and b vector.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc15.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc15.png"><img loading="lazy" class="alignnone size-full wp-image-553" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc15.png" alt="eqc15" width="169" height="131" /></a>

The b vector is fairly straight forward to compute. Therefore I&#8217;ll skip that and compute the K matrix symbolically:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/03/prismaticc-3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-3.png"><img loading="lazy" class="alignnone size-full wp-image-700" src="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-3.png" alt="prismaticc (3)" width="775" height="99" srcset="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-3.png 775w, http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-3-300x38.png 300w" sizes="(max-width: 775px) 100vw, 775px" /></a>

Multiplying left to right the first two matrices we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/03/prismaticc-4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-4.png"><img loading="lazy" class="alignnone size-full wp-image-701" src="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-4.png" alt="prismaticc (4)" width="740" height="90" srcset="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-4.png 740w, http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-4-300x36.png 300w" sizes="(max-width: 740px) 100vw, 740px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/03/prismaticc-5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-5.png"><img loading="lazy" class="alignnone size-full wp-image-702" src="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-5.png" alt="prismaticc (5)" width="976" height="50" srcset="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-5.png 976w, http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-5-300x15.png 300w" sizes="(max-width: 976px) 100vw, 976px" /></a>

If we use the following just to clean things up:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/03/prismaticc-6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-6.png"><img loading="lazy" class="alignnone size-full wp-image-703" src="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-6.png" alt="prismaticc (6)" width="204" height="66" /></a>

We get:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/03/prismaticc-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-7.png"><img loading="lazy" class="alignnone size-full wp-image-704" src="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-7.png" alt="prismaticc (7)" width="617" height="50" srcset="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-7.png 617w, http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-7-300x24.png 300w" sizes="(max-width: 617px) 100vw, 617px" /></a>

And if t is normalized we get:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/03/prismaticc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-1.png"><img loading="lazy" class="alignnone size-full wp-image-698" src="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-1.png" alt="prismaticc (1)" width="522" height="50" srcset="http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-1.png 522w, http://www.dyn4j.org/wp-content/uploads/2011/03/prismaticc-1-300x29.png 300w" sizes="(max-width: 522px) 100vw, 522px" /></a>

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.