---
id: 376
title: Pulley Constraint
date: 2010-12-30T13:32:42-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=300
permalink: /2010/12/pulley-constraint/
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
The next equality constraint we will derive is the pulley constraint. A pulley constraint can be used to join two bodies at a fixed distance. In addition, the constraint can be used to simulate a block-and-tackle.  
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

What follows is the derivation of the equations needed to solve for a Pulley constraint.  
<a name="ptp-process"></a>  
[Process Overview](#ptp-top)  
Let&#8217;s review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find J, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley1.png"><img loading="lazy" class=" size-full wp-image-630 alignright" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley1.png" alt="pulley1" width="228" height="383" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley1.png 228w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley1-179x300.png 179w" sizes="(max-width: 228px) 100vw, 228px" /></a>

Once the Jacobian is found we use that to compute the K matrix. The K matrix is the A in the Ax = b general form equation.  
<a name="ptp-position"></a>  
[Position Constraint](#ptp-top)  
So the first step is to write out an equation that describes the constraint. A Distance Joint should allow the two bodies to move and rotate freely, but should keep them at a certain distance from one another. For a Pulley Joint its similar except that the bodes distance is constrained to two axes. In the middle we will allow the option of a block-and-tackle. Examining the image to the right, we see that there are two bodies: Ba, Bb who have distance constraints that are along axes: Ua, Ub which were formed from the Ground and Body anchor points: GAa, GAb, BAa, BAb.

Given this definition we can see that the direction of Ua and Ub can change if the bodies swing left or right for example.

Unlike the Distance Joint, a Pulley Joint allows the distances from the ground anchors to the body anchors to increase and decrease (the magnitude of Ua and Ub can also change). However, the **total** distance along the two axes must be equal to the initial distance when the joint was created (this is what we are trying to constrain). If we apply some scalar factor (or ratio) to the distances we can simulate a block-and-tackle.

We can represent this constraint by the following equation:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-1.png"><img loading="lazy" class="alignnone size-full wp-image-641" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-1.png" alt="pulley (1)" width="227" height="29" /></a>

Where:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-19.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-19.png"><img loading="lazy" class="alignnone size-full wp-image-655" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-19.png" alt="pulley (19)" width="151" height="25" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-19.png 151w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-19-150x25.png 150w" sizes="(max-width: 151px) 100vw, 151px" /></a>  
<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2.png"><img loading="lazy" class="alignnone size-full wp-image-642" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2.png" alt="pulley (2)" width="403" height="34" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2.png 403w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2-300x25.png 300w" sizes="(max-width: 403px) 100vw, 403px" /></a>  
<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7.png"><img loading="lazy" class="alignnone size-full wp-image-647" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7.png" alt="pulley (7)" width="389" height="34" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7.png 389w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7-300x26.png 300w" sizes="(max-width: 389px) 100vw, 389px" /></a>

Where <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-3.png"><img loading="lazy" class="alignnone size-full wp-image-643" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-3.png" alt="pulley (3)" width="137" height="32" /></a> are the length of Ua, body a&#8217;s body anchor point, body a&#8217;s ground anchor point, and the vector Ua respectively.

Likewise <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-4.png"><img loading="lazy" class="alignnone size-full wp-image-644" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-4.png" alt="pulley (4)" width="128" height="32" /></a> are the length of Ub, body b&#8217;s body anchor point, body b&#8217;s ground anchor point, and the vector Ub respectively.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/c-sub-i.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/c-sub-i.png"><img loading="lazy" class="alignnone size-full wp-image-631" src="http://www.dyn4j.org/wp-content/uploads/2010/12/c-sub-i.png" alt="c-sub-i" width="26" height="25" /></a> is computed once when the joint is created to obtain the target **total** length of the pulley.

Finally <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/r.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/r.png"><img loading="lazy" class="alignnone size-full wp-image-632" src="http://www.dyn4j.org/wp-content/uploads/2010/12/r.png" alt="r" width="13" height="12" /></a> is a scalar ratio value that will allow us to simulate a block-and-tackle.

To review, our position constraint calculates the current lengths of the two axes (applying the ratio to one) and subtracts it from the initial to find how much the constraint is violated.  
<a name="ptp-derivative"></a>  
[The Derivative](#ptp-top)  
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.
> 
> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

Taking the derivative of our position constraint we get:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-5.png"><img loading="lazy" class="alignnone size-full wp-image-645" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-5.png" alt="pulley (5)" width="267" height="47" /></a>

Then just to clean up a bit:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-6.png"><img loading="lazy" class="alignnone size-full wp-image-646" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-6.png" alt="pulley (6)" width="261" height="47" /></a>

Now we need to perform the derivative on <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/l.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png"><img loading="lazy" class="alignnone size-full wp-image-581" src="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png" alt="l" width="7" height="19" /></a>. If we remember <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/l.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png"><img loading="lazy" class="alignnone size-full wp-image-581" src="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png" alt="l" width="7" height="19" /></a> was defined as:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2.png"><img loading="lazy" class="alignnone size-full wp-image-642" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2.png" alt="pulley (2)" width="403" height="34" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2.png 403w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-2-300x25.png 300w" sizes="(max-width: 403px) 100vw, 403px" /></a>  
<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7.png"><img loading="lazy" class="alignnone size-full wp-image-647" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7.png" alt="pulley (7)" width="389" height="34" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7.png 389w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-7-300x26.png 300w" sizes="(max-width: 389px) 100vw, 389px" /></a>

So let&#8217;s side step for a minute and perform the derivative of <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/l.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png"><img loading="lazy" class="alignnone size-full wp-image-581" src="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png" alt="l" width="7" height="19" /></a>:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-8.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-8.png"><img loading="lazy" class="alignnone size-full wp-image-648" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-8.png" alt="pulley (8)" width="364" height="485" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-8.png 364w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-8-225x300.png 225w" sizes="(max-width: 364px) 100vw, 364px" /></a>

We needed to use the chain rule in order to fully compute the derivative where the derivative of u:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-9.png"><img loading="lazy" class="alignnone size-full wp-image-649" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-9.png" alt="pulley (9)" width="305" height="170" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-9.png 305w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-9-300x167.png 300w" sizes="(max-width: 305px) 100vw, 305px" /></a>

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.
> 
> Note here that the g vector (ground anchor) is constant and therefore becomes the zero vector.

In the last few steps I replaced a portion of the equation with:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/nt.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/nt.png"><img loading="lazy" class="alignnone size-full wp-image-633" src="http://www.dyn4j.org/wp-content/uploads/2010/12/nt.png" alt="nt" width="157" height="56" /></a>

In addition, I replaced the dot product with a matrix multiplication by:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/dot-product-to-matrix-mult.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/dot-product-to-matrix-mult.png"><img loading="lazy" class="alignnone size-full wp-image-636" src="http://www.dyn4j.org/wp-content/uploads/2010/12/dot-product-to-matrix-mult.png" alt="dot-product-to-matrix-mult" width="221" height="136" /></a>

Now if we substitute back into the original equation we get:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-16.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-16.png"><img loading="lazy" class="alignnone size-full wp-image-638" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-16.png" alt="pulley (16)" width="658" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-16.png 658w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-16-300x16.png 300w" sizes="(max-width: 658px) 100vw, 658px" /></a>

<a name="ptp-isolate"></a>  
[Isolate The Velocities](#ptp-top)  
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two velocity variables. In fact, there are actually four, the linear and angular velocities of both bodies. To isolate the velocities we will need to employ some identities and matrix math.

The linear velocities are already isolated so we can ignore those for now. The angular velocities on the other hand have a pesky cross product. In 3D, we can use the identity that a cross product of two vectors is the same as the multiplication by a skew symmetric matrix and the other vector; see <a onclick="javascript:pageTracker._trackPageview('/outgoing/en.wikipedia.org/wiki/Cross_product');"  href="http://en.wikipedia.org/wiki/Cross_product">here</a>. For 2D, we can do something similar by examining the cross product itself:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-10.png"><img loading="lazy" class="alignnone size-full wp-image-603" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-10.png" alt="dc (10)" width="326" height="98" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-10.png 326w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-10-300x90.png 300w" sizes="(max-width: 326px) 100vw, 326px" /></a>

> Remember that the angular velocity in 2D is a scalar.

Removing the cross products using the process above yields:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-17.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-17.png"><img loading="lazy" class="alignnone size-full wp-image-639" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-17.png" alt="pulley (17)" width="568" height="56" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-17.png 568w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-17-300x30.png 300w" sizes="(max-width: 568px) 100vw, 568px" /></a>

Now, just to clean up some, if we inspect:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/ntrs.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/ntrs.png"><img loading="lazy" class="alignnone size-full wp-image-635" src="http://www.dyn4j.org/wp-content/uploads/2010/12/ntrs.png" alt="ntrs" width="259" height="142" /></a>

Now replacing what we found above into the original equation (and some clean up):

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-10.png"><img loading="lazy" class="alignnone size-full wp-image-650" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-10.png" alt="pulley (10)" width="622" height="97" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-10.png 622w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-10-300x47.png 300w" sizes="(max-width: 622px) 100vw, 622px" /></a>

Now if we employ some matrix multiplication we can separate the velocities from the known coefficients:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-11.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-11.png"><img loading="lazy" class="alignnone wp-image-651 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-11.png" alt="pulley (11)" width="494" height="84" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-11.png 494w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-11-300x51.png 300w" sizes="(max-width: 494px) 100vw, 494px" /></a>

Now, by inspection, we obtain the Jacobian:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-12.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-12.png"><img loading="lazy" class="alignnone size-full wp-image-652" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-12.png" alt="pulley (12)" width="511" height="37" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-12.png 511w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-12-300x22.png 300w" sizes="(max-width: 511px) 100vw, 511px" /></a>  
<a name="ptp-kmatrix"></a>  
[Compute The K Matrix](#ptp-top)  
Lastly, to solve the constraint we need to compute the values for A (I use the name K) and b:

> See the &#8220;Equality Constraints&#8221; post for the derivation of the A matrix and b vector.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png"><img loading="lazy" class="alignnone size-full wp-image-573" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png" alt="ptpc (1)" width="169" height="131" /></a>

The b vector is fairly straight forward to compute. Therefore I&#8217;ll skip that and compute the K matrix symbolically:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-13.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-13.png"><img loading="lazy" class="alignnone size-full wp-image-653" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-13.png" alt="pulley (13)" width="805" height="99" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-13.png 805w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-13-300x37.png 300w" sizes="(max-width: 805px) 100vw, 805px" /></a>

Multiplying left to right the first two matrices we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-14.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-14.png"><img loading="lazy" class="alignnone size-full wp-image-654" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-14.png" alt="pulley (14)" width="738" height="76" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-14.png 738w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-14-300x31.png 300w" sizes="(max-width: 738px) 100vw, 738px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-15.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-15.png"><img loading="lazy" class="alignnone size-full wp-image-637" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-15.png" alt="pulley (15)" width="546" height="71" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-15.png 546w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-15-300x39.png 300w" sizes="(max-width: 546px) 100vw, 546px" /></a>

If we simplify using:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/ntn.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/ntn.png"><img loading="lazy" class="alignnone size-full wp-image-634" src="http://www.dyn4j.org/wp-content/uploads/2010/12/ntn.png" alt="ntn" width="240" height="151" /></a>

> Remember the inertia tensor in 2D is a scalar, therefore we can pull it out to the front of the multiplications.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/pulley-18.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-18.png"><img loading="lazy" class="alignnone size-full wp-image-640" src="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-18.png" alt="pulley (18)" width="664" height="30" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-18.png 664w, http://www.dyn4j.org/wp-content/uploads/2010/12/pulley-18-300x14.png 300w" sizes="(max-width: 664px) 100vw, 664px" /></a>

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.