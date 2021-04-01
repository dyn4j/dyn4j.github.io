---
id: 377
title: Angle Constraint
date: 2010-12-30T14:45:25-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=330
permalink: /2010/12/angle-constraint/
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
The next equality constraint we will derive is the angle constraint. An angle constraint can be used to join two bodies forcing them to have the same rotation. This particular constraint will be added to other constraints (in later posts) to form more complex constraints.  
<!--more-->

<a name="ptp-top"></a>

  1. [Problem Definition](#ptp-problem)
  2. [Process Overview](#ptp-process)
  3. [Position Constraint](#ptp-position)
  4. [The Derivative](#ptp-derivative)
  5. [Isolate The Velocities](#ptp-isolate)
  6. [Compute The K Matrix](#ptp-kmatrix)

<a name="ptp-problem"></a>  
[Problem Definition](#ptp-top)  
It&#8217;s probably good to start with a good definition of what we are trying to accomplish.

We want to take two or more bodies and constrain their motion in some way. For instance, say we want two bodies to only be able to rotate about a common point (Revolute Joint). The most common application are constraints between pairs of bodies. Because we have constrained the motion of the bodies, we must find the correct velocities, so that constraints are satisfied otherwise the integrator would allow the bodies to move forward along their current paths. To do this we need to create equations that allow us to solve for the velocities.

What follows is the derivation of the equations needed to solve for an Angle constraint.  
<a name="ptp-process"></a>  
[Process Overview](#ptp-top)  
Let&#8217;s review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find J, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the K matrix. The K matrix is the A in the Ax = b general form equation.  
<a name="ptp-position"></a>  
[Position Constraint](#ptp-top)  
So the first step is to write out an equation that describes the constraint. An Angle Joint should allow the two bodies to move and freely, but should keep their rotations the same. In other words:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/anglec-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-2.png"><img loading="lazy" class="alignnone size-full wp-image-658" src="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-2.png" alt="anglec (2)" width="274" height="25" /></a>

which says that the rotation about the center of body a minus the rotation about the center of body b should equal the initial reference angle calculated when the joint was created.  
<a name="ptp-derivative"></a>  
[The Derivative](#ptp-top)  
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.
> 
> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

> As a side note, this is one of the easiest constraints to both derive and implement.

Start by taking the derivative of the position constraint:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/anglec-3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-3.png"><img loading="lazy" class="alignnone size-full wp-image-659" src="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-3.png" alt="anglec (3)" width="304" height="139" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-3.png 304w, http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-3-300x137.png 300w" sizes="(max-width: 304px) 100vw, 304px" /></a>  
<a name="ptp-isolate"></a>  
[Isolate The Velocities](#ptp-top)  
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two angular velocity variables. To isolate the velocities we will need to employ some matrix math.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/anglec-4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-4.png"><img loading="lazy" class="alignnone size-full wp-image-660" src="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-4.png" alt="anglec (4)" width="260" height="68" /></a>

> Notice that I still included the linear velocities in the equation even though they are not present. This is necessary since the mass matrix is a 4&#215;4 matrix so that we can multiply the matrices in the next step.

Now, by inspection, we obtain the Jacobian:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/anglec-5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-5.png"><img loading="lazy" class="alignnone wp-image-661 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-5.png" alt="anglec (5)" width="159" height="30" /></a>  
<a name="ptp-kmatrix"></a>  
[Compute The K Matrix](#ptp-top)  
Lastly, to solve the constraint we need to compute the values for A (I use the name K) and b:

> See the &#8220;Equality Constraints&#8221; post for the derivation of the A matrix and b vector.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png"><img loading="lazy" class="alignnone size-full wp-image-573" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png" alt="ptpc (1)" width="169" height="131" /></a>

The b vector is fairly straight forward to compute. Therefore I&#8217;ll skip that and compute the K matrix symbolically:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/anglec-6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-6.png"><img loading="lazy" class="alignnone size-full wp-image-662" src="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-6.png" alt="anglec (6)" width="563" height="108" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-6.png 563w, http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-6-300x58.png 300w" sizes="(max-width: 563px) 100vw, 563px" /></a>

Multiplying left to right the first two matrices we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/anglec-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-7.png"><img loading="lazy" class="alignnone size-full wp-image-663" src="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-7.png" alt="anglec (7)" width="369" height="68" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-7.png 369w, http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-7-300x55.png 300w" sizes="(max-width: 369px) 100vw, 369px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/anglec-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-1.png"><img loading="lazy" class="alignnone size-full wp-image-657" src="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-1.png" alt="anglec (1)" width="261" height="34" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-1.png 261w, http://www.dyn4j.org/wp-content/uploads/2010/12/anglec-1-250x34.png 250w" sizes="(max-width: 261px) 100vw, 261px" /></a>

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.