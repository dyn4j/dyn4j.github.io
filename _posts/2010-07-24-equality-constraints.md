---
id: 371
title: Equality Constraints
date: 2010-07-24T13:36:21-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=191
permalink: /2010/07/equality-constraints/
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
After the first release of the [dyn4j](http://www.dyn4j.org) project, I felt that it would be good to pass along what I learned about constrained dynamics.

This is not an easy subject and aside from purchasing books there&#8217;s not much information out there about it for those of us not accustomed to reading research papers or theses.

In this post I plan to solve a velocity constraint generally. Later posts will be for the individual types of constraints.  
<!--more-->

  
A phyiscial constraint is defined by some function:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc0.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc0.png"><img loading="lazy" class=" size-full wp-image-554 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc0.png" alt="eqc0" width="204" height="29" /></a>

Where x is the position of the body and R is the rotation of the body. Typically constraints are pairwise. You can formulate constraints using any number of bodies, however, pairwise formulations are simple. When this function is equal to zero the constraint is satisfied.

If we perform the derivative with respect to time we get the velocity constraint

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc1.png"><img loading="lazy" class=" size-full wp-image-539 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc1.png" alt="eqc1" width="121" height="35" /></a>

Since C is a function of positions and rotations who are themselves functions of time, we must perform the chain rule. The derivative of one vector function (C) by another vector function (x) yields a Jacobian matrix:

<div id="attachment_540" style="width: 112px" class="wp-caption alignnone">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc2.png"><img aria-describedby="caption-attachment-540" loading="lazy" class="wp-image-540 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc2.png" alt="Equation 1" width="102" height="35" /></a>
  
  <p id="caption-attachment-540" class="wp-caption-text">
    Equation 1
  </p>
</div>

Where v is the vector of velocities from the bodies. The Jacobian rows contain the gradients of the scalar components of the constraint function C. We know that the gradient direction is the highest rate of increase of the scalar function C and unless the constraint is satisfied then it will be non-zero. Therefore the gradient is the direction of the illegal movement. We want the constraint force to act in this direction since we don&#8217;t want to constrain legal movement:

<div id="attachment_541" style="width: 121px" class="wp-caption alignnone">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc3.png"><img aria-describedby="caption-attachment-541" loading="lazy" class="wp-image-541 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc3.png" alt="Equation 2" width="111" height="32" /></a>
  
  <p id="caption-attachment-541" class="wp-caption-text">
    Equation 2
  </p>
</div>

Where lambda a vector of the magnitudes of the constraint forces. The constraint force is the force that must be applied to counter act external forces so that the constraint is satisfied.

We know that the final velocity of a system is:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc4.png"><img loading="lazy" class=" size-full wp-image-542 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc4.png" alt="eqc4" width="187" height="31" /></a>

We also know that the sum of all the forces on a body is:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc5.png"><img loading="lazy" class=" size-full wp-image-543 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc5.png" alt="eqc5" width="234" height="108" /></a>

We can split the external forces and the constraint forces apart and then distribute:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc6.png"><img loading="lazy" class="alignnone wp-image-544 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc6.png" alt="eqc6" width="411" height="73" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc6.png 411w, http://www.dyn4j.org/wp-content/uploads/2010/07/eqc6-300x53.png 300w" sizes="(max-width: 411px) 100vw, 411px" /></a>

If we look closely we can perform the integration using the external forces separately therefore removing the external forces from the equation:

<div id="attachment_545" style="width: 248px" class="wp-caption alignnone">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc7.png"><img aria-describedby="caption-attachment-545" loading="lazy" class="wp-image-545 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc7.png" alt="Equation 3" width="238" height="36" /></a>
  
  <p id="caption-attachment-545" class="wp-caption-text">
    Equation 3
  </p>
</div>

Now if we substitute equation [2] into [3]:

<div id="attachment_546" style="width: 275px" class="wp-caption alignnone">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc8.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc8.png"><img aria-describedby="caption-attachment-546" loading="lazy" class="wp-image-546 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc8.png" alt="Equation 4" width="265" height="36" /></a>
  
  <p id="caption-attachment-546" class="wp-caption-text">
    Equation 4
  </p>
</div>

Now if we substitue equation [4] into equation [1]:

<div id="attachment_547" style="width: 314px" class="wp-caption alignnone">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc9.png"><img aria-describedby="caption-attachment-547" loading="lazy" class="wp-image-547 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc9.png" alt="Equation 5" width="304" height="37" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc9.png 304w, http://www.dyn4j.org/wp-content/uploads/2010/07/eqc9-300x37.png 300w" sizes="(max-width: 304px) 100vw, 304px" /></a>
  
  <p id="caption-attachment-547" class="wp-caption-text">
    Equation 5
  </p>
</div>

Now if we rearrange the terms to match the form Ax = b:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc10.png"><img loading="lazy" class="alignnone wp-image-548 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc10.png" alt="" width="323" height="116" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc10.png 323w, http://www.dyn4j.org/wp-content/uploads/2010/07/eqc10-300x108.png 300w" sizes="(max-width: 323px) 100vw, 323px" /></a>

We also know that:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc11.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc11.png"><img loading="lazy" class=" size-full wp-image-549 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc11.png" alt="eqc11" width="103" height="32" /></a>

Where P is the impulse, therefore:

<div id="attachment_550" style="width: 300px" class="wp-caption alignnone">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc12.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc12.png"><img aria-describedby="caption-attachment-550" loading="lazy" class="wp-image-550 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc12.png" alt="Equation 6" width="290" height="37" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc12.png 290w, http://www.dyn4j.org/wp-content/uploads/2010/07/eqc12-285x37.png 285w" sizes="(max-width: 290px) 100vw, 290px" /></a>
  
  <p id="caption-attachment-550" class="wp-caption-text">
    Equation 6
  </p>
</div>

Where lambda is the constraint impulse. We stated at the beginning of the post that if the constraint is satisfied if the constraint equals zero. This is true for the velocity constraint as well:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc13.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc13.png"><img loading="lazy" class=" size-full wp-image-551 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc13.png" alt="eqc13" width="268" height="34" /></a>

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc14.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc14.png"><img loading="lazy" class=" size-full wp-image-552 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc14.png" alt="eqc14" width="242" height="34" /></a>

This will solve the constraint exactly, however, given that the integrator is only an approximation of the ODE and the lack of infinite precision the constraint will &#8220;drift.&#8221; For example, a point-to-point constraint (simulates a revolute joint) will drift, where the local points of the world space anchor point slowly separate over time.

Drift can be solve using methods like Baumgarte stabilization, post/pre stabilizations methods, etc. That will be left for another post.

The equation is now in the form:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc15.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc15.png"><img loading="lazy" class=" size-full wp-image-553 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc15.png" alt="eqc15" width="169" height="131" /></a>

and can be solved using any linear equation solver desired. After solving for lamda, we can substitute it back into equation 4:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc16.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc16.png"><img loading="lazy" class="alignnone wp-image-537 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc16.png" alt="eqc16" width="265" height="111" /></a>

to find the final velocities.

Remember that the velocity vector is the velocity of the **system** and the mass matrix is the mass of the **system**. For example, a two body system would have the form:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc17.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc17.png"><img loading="lazy" class=" size-full wp-image-538 alignnone" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc17.png" alt="eqc17" width="220" height="108" /></a>

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc18.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc18.png"><img loading="lazy" class="alignnone wp-image-555 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc18.png" alt="eqc18" width="196" height="30" /></a>

The Jacobian, as we will see in the next few posts, will be specific to the type of constraint being added and the number of bodies involved (as we see above).