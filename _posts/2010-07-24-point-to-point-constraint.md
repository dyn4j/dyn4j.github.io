---
id: 372
title: Point-to-Point Constraint
date: 2010-07-24T21:47:38-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=225
permalink: /2010/07/point-to-point-constraint/
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
As the first entry after the Equality Constraints post, we will perform the derivation of the Point-to-Point constraint, which models a Revolute Joint, in 2D.  
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
It&#8217;s probably good to start with a good definition of what we are trying to accomplish. From the last post on equality constraints it may not be clear what we are trying to do.

We want to take two or more bodies and constrain their motion in some way. For instance, say we want two bodies to only be able to rotate about a common point (Revolute Joint). The most common application are constraints between pairs of bodies. Because we have constrained the motion of the bodies, we must find the correct velocities, so that constraints are satisfied otherwise the integrator would allow the bodies to move forward along their current paths. To do this we need to create equations that allow us to solve for the velocities.

What follows is the derivation of the equations needed to solve for a Point-to-Point constraint which models a Revolute Joint.  
<a name="ptp-process"></a>  
[Process Overview](#ptp-top)  
Since this is the first specific constraint I&#8217;ll post on, we need to go through how we actually perform the derivation.

<a onclick="javascript:pageTracker._trackPageview('/outgoing/www.box2d.com/');"  href="http://www.box2d.com/">Erin Cato</a> lays out the process quite simply:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using this formula we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find J, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the K matrix. The K matrix is the A in the Ax = b general form equation.  
<a name="ptp-position"></a>  
[Position Constraint](#ptp-top)  
So the first step is to write out an equation that describes the constraint. A Revolute Joint should allow the two bodies to rotate about a common point, but should not allow them to translate away or towards each other. In other words:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-7.png"><img loading="lazy" class="alignnone wp-image-566 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-7.png" alt="ptpc (7)" width="380" height="29" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-7.png 380w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-7-300x23.png 300w" sizes="(max-width: 380px) 100vw, 380px" /></a>

which says the points <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/pa.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/pa.png"><img loading="lazy" class="alignnone size-full wp-image-574" src="http://www.dyn4j.org/wp-content/uploads/2010/07/pa.png" alt="pa" width="27" height="25" /></a> and <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/pb.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/pb.png"><img loading="lazy" class="alignnone size-full wp-image-575" src="http://www.dyn4j.org/wp-content/uploads/2010/07/pb.png" alt="pb" width="25" height="25" /></a> must be the same point. This allows the bodies to translate freely but only together.

<a name="ptp-derivative"></a>  
[The Derivative](#ptp-top)  
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.
> 
> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

First if we write out how <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/pa.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/pa.png"><img loading="lazy" class="alignnone size-full wp-image-574" src="http://www.dyn4j.org/wp-content/uploads/2010/07/pa.png" alt="pa" width="27" height="25" /></a> and <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/pb.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/pb.png"><img loading="lazy" class="alignnone size-full wp-image-575" src="http://www.dyn4j.org/wp-content/uploads/2010/07/pb.png" alt="pb" width="25" height="25" /></a> are computed we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-8.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-8.png"><img loading="lazy" class="alignnone wp-image-567 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-8.png" alt="ptpc (8)" width="522" height="29" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-8.png 522w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-8-300x17.png 300w" sizes="(max-width: 522px) 100vw, 522px" /></a>

Where <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/xa.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/xa.png"><img loading="lazy" class="alignnone size-full wp-image-577" src="http://www.dyn4j.org/wp-content/uploads/2010/07/xa.png" alt="xa" width="28" height="25" /></a> and <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/xb.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/xb.png"><img loading="lazy" class="alignnone size-full wp-image-578" src="http://www.dyn4j.org/wp-content/uploads/2010/07/xb.png" alt="xb" width="26" height="25" /></a> are the centers of mass (or positions), <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/rota.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/rota.png"><img loading="lazy" class="alignnone size-full wp-image-558" src="http://www.dyn4j.org/wp-content/uploads/2010/07/rota.png" alt="rota" width="35" height="25" /></a> and <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/rotb.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/rotb.png"><img loading="lazy" class="alignnone size-full wp-image-559" src="http://www.dyn4j.org/wp-content/uploads/2010/07/rotb.png" alt="rotb" width="33" height="25" /></a> are the rotation matrices, and <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ra.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ra.png"><img loading="lazy" class="alignnone size-full wp-image-560" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ra.png" alt="ra" width="24" height="25" /></a> and <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/rb.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/rb.png"><img loading="lazy" class="alignnone size-full wp-image-561" src="http://www.dyn4j.org/wp-content/uploads/2010/07/rb.png" alt="rb" width="22" height="25" /></a> are the vectors from the centers of mass to the common point.

Now that the constraint is written in the correct variables we can perform the derivative

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-9.png"><img loading="lazy" class="alignnone size-full wp-image-568" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-9.png" alt="ptpc (9)" width="401" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-9.png 401w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-9-300x26.png 300w" sizes="(max-width: 401px) 100vw, 401px" /></a>

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.

<a name="ptp-isolate"></a>  
[Isolate The Velocities](#ptp-top)  
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two velocity variables. In fact, there are actually four, the linear and angular velocities of both bodies. To isolate the velocities we will need to employ some identities and matrix math.

The linear velocities are already isolated so we can ignore those for now. The angular velocities on the other hand have a pesky cross product. In 3D, we can use the identity that a cross product of two vectors is the same as the multiplication by a skew symmetric matrix and the other vector; see <a onclick="javascript:pageTracker._trackPageview('/outgoing/en.wikipedia.org/wiki/Cross_product');"  href="http://en.wikipedia.org/wiki/Cross_product">here</a>. For 2D, we can do something similar by examining the cross product itself:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10.png"><img loading="lazy" class="alignnone wp-image-569 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10.png" alt="ptpc (10)" width="326" height="98" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10.png 326w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10-300x90.png 300w" sizes="(max-width: 326px) 100vw, 326px" /></a>

> Remember that the angular velocity in 2D is a scalar.

Removing the cross products using the process above yields:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-11.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-11.png"><img loading="lazy" class="alignnone size-full wp-image-570" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-11.png" alt="ptpc (11)" width="378" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-11.png 378w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-11-300x28.png 300w" sizes="(max-width: 378px) 100vw, 378px" /></a>

Now if we employ some matrix multiplication we can separate the velocities from the known coefficients:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-12.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-12.png"><img loading="lazy" class="alignnone wp-image-571 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-12.png" alt="ptpc (12)" width="316" height="71" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-12.png 316w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-12-300x67.png 300w" sizes="(max-width: 316px) 100vw, 316px" /></a>

Now, by inspection, we obtain the Jacobian:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-13.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-13.png"><img loading="lazy" class="alignnone size-full wp-image-572" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-13.png" alt="ptpc (13)" width="233" height="30" /></a>  
<a name="ptp-kmatrix"></a>  
[Compute The K Matrix](#ptp-top)  
Lastly, to solve the constraint we need to compute the values for A (I use the name K) and b:

> See the &#8220;Equality Constraints&#8221; post for the derivation of the A matrix and b vector.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png"><img loading="lazy" class="alignnone size-full wp-image-573" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png" alt="ptpc (1)" width="169" height="131" /></a>

The b vector is fairly straight forward to compute. Therefore I&#8217;ll skip that and compute the K matrix symbolically:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-2.png"><img loading="lazy" class="alignnone size-full wp-image-576" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-2.png" alt="ptpc (2)" width="666" height="108" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-2.png 666w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-2-300x49.png 300w" sizes="(max-width: 666px) 100vw, 666px" /></a>

Multiplying left to right the first two matrices we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-3.png"><img loading="lazy" class="alignnone size-full wp-image-562" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-3.png" alt="ptpc (3)" width="570" height="88" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-3.png 570w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-3-300x46.png 300w" sizes="(max-width: 570px) 100vw, 570px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-4.png"><img loading="lazy" class="alignnone size-full wp-image-563" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-4.png" alt="ptpc (4)" width="636" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-4.png 636w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-4-300x17.png 300w" sizes="(max-width: 636px) 100vw, 636px" /></a>

Now if we write out the equation element wise:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-5.png"><img loading="lazy" class="alignnone size-full wp-image-564" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-5.png" alt="ptpc (5)" width="512" height="108" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-5.png 512w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-5-300x63.png 300w" sizes="(max-width: 512px) 100vw, 512px" /></a>

> Remember the inertia tensor in 2D is a scalar, therefore we can pull it out to the front of the multiplications.

Multiplying the matrices and adding them yields:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-6.png"><img loading="lazy" class="alignnone size-full wp-image-565" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-6.png" alt="ptpc (6)" width="720" height="304" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-6.png 720w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-6-300x127.png 300w" sizes="(max-width: 720px) 100vw, 720px" /></a>

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.