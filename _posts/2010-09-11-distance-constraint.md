---
id: 374
title: Distance Constraint
date: 2010-09-11T13:07:48-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=267
permalink: /2010/09/distance-constraint/
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
The next equality constraint we will derive is the distance constraint. A distance constraint can be used to join two bodies at a fixed distance. It can also be used as a spring between two bodies.  
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

What follows is the derivation of the equations needed to solve for a Distance constraint.  
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
So the first step is to write out an equation that describes the constraint. A Distance Joint should allow the two bodies to move and rotate freely, but should keep them at a certain distance from one another. In other words:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-21.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-21.png"><img loading="lazy" class="alignnone size-full wp-image-614" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-21.png" alt="dc (21)" width="113" height="21" /></a>

which says that the current distance, <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/d.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/d.png"><img loading="lazy" class="alignnone size-full wp-image-580" src="http://www.dyn4j.org/wp-content/uploads/2010/07/d.png" alt="d" width="14" height="19" /></a> and the desired distance, <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/l.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png"><img loading="lazy" class="alignnone size-full wp-image-581" src="http://www.dyn4j.org/wp-content/uploads/2010/07/l.png" alt="l" width="7" height="19" /></a> must be equal to zero.  
<a name="ptp-derivative"></a>  
[The Derivative](#ptp-top)  
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.
> 
> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

First if we write out how <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/d.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/d.png"><img loading="lazy" class="alignnone size-full wp-image-580" src="http://www.dyn4j.org/wp-content/uploads/2010/07/d.png" alt="d" width="14" height="19" /></a> is computed we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-22.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-22.png"><img loading="lazy" class="alignnone size-full wp-image-615" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-22.png" alt="dc (22)" width="213" height="28" /></a>

Where <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/pa.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/pa.png"><img loading="lazy" class="alignnone size-full wp-image-574" src="http://www.dyn4j.org/wp-content/uploads/2010/07/pa.png" alt="pa" width="27" height="25" /></a> and <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/pb.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/pb.png"><img loading="lazy" class="alignnone size-full wp-image-575" src="http://www.dyn4j.org/wp-content/uploads/2010/07/pb.png" alt="pb" width="25" height="25" /></a> are the anchor points on the respective bodies.

We can rewrite this equation changing the magnitude to:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-23.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-23.png"><img loading="lazy" class="alignnone size-full wp-image-616" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-23.png" alt="dc (23)" width="362" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-23.png 362w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-23-300x29.png 300w" sizes="(max-width: 362px) 100vw, 362px" /></a>

Since the squared magnitude of a vector is the dot product of the vector and itself.

Now we perform the derivative:

First let:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ud.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ud.png"><img loading="lazy" class="alignnone size-full wp-image-582" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ud.png" alt="ud" width="137" height="25" /></a>

so

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-1.png"><img loading="lazy" class="alignnone size-full wp-image-617" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-1.png" alt="dc (1)" width="174" height="29" /></a>

by the chain rule:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-2.png"><img loading="lazy" class="alignnone size-full wp-image-618" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-2.png" alt="dc (2)" width="253" height="45" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-2.png 253w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-2-250x45.png 250w" sizes="(max-width: 253px) 100vw, 253px" /></a>

by the chain rule again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-3.png"><img loading="lazy" class="alignnone size-full wp-image-619" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-3.png" alt="dc (3)" width="359" height="45" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-3.png 359w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-3-300x38.png 300w" sizes="(max-width: 359px) 100vw, 359px" /></a>

Since the dot product is cumulative and distributive over addition:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-4.png"><img loading="lazy" class="alignnone size-full wp-image-620" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-4.png" alt="dc (4)" width="254" height="45" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-4.png 254w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-4-250x45.png 250w" sizes="(max-width: 254px) 100vw, 254px" /></a>

If we clean up a bit:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-5.png"><img loading="lazy" class="alignnone size-full wp-image-621" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-5.png" alt="dc (5)" width="214" height="44" /></a>

Now we know that:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-6.png"><img loading="lazy" class="alignnone wp-image-622 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-6.png" alt="dc (6)" width="248" height="139" /></a>

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.

So

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-7.png"><img loading="lazy" class="alignnone size-full wp-image-600" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-7.png" alt="dc (7)" width="522" height="40" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-7.png 522w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-7-300x23.png 300w" sizes="(max-width: 522px) 100vw, 522px" /></a>

We can also let:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-8.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-8.png"><img loading="lazy" class="alignnone size-full wp-image-601" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-8.png" alt="dc (8)" width="92" height="40" /></a>

Giving us:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-9.png"><img loading="lazy" class="alignnone size-full wp-image-602" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-9.png" alt="dc (9)" width="458" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-9.png 458w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-9-300x23.png 300w" sizes="(max-width: 458px) 100vw, 458px" /></a>

<a name="ptp-isolate"></a>  
[Isolate The Velocities](#ptp-top)  
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two velocity variables. In fact, there are actually four, the linear and angular velocities of both bodies. To isolate the velocities we will need to employ some identities and matrix math.

The linear velocities are already isolated so we can ignore those for now. The angular velocities on the other hand have a pesky cross product. In 3D, we can use the identity that a cross product of two vectors is the same as the multiplication by a skew symmetric matrix and the other vector; see <a onclick="javascript:pageTracker._trackPageview('/outgoing/en.wikipedia.org/wiki/Cross_product');"  href="http://en.wikipedia.org/wiki/Cross_product">here</a>. For 2D, we can do something similar by examining the cross product itself:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10.png"><img loading="lazy" class="alignnone size-full wp-image-569" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10.png" alt="ptpc (10)" width="326" height="98" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10.png 326w, http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-10-300x90.png 300w" sizes="(max-width: 326px) 100vw, 326px" /></a>

> Remember that the angular velocity in 2D is a scalar.

Removing the cross products using the process above yields:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-11.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-11.png"><img loading="lazy" class="alignnone size-full wp-image-604" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-11.png" alt="dc (11)" width="434" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-11.png 434w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-11-300x24.png 300w" sizes="(max-width: 434px) 100vw, 434px" /></a>

Now if we employ some matrix multiplication we can separate the velocities from the known coefficients:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-12.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-12.png"><img loading="lazy" class="alignnone size-full wp-image-605" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-12.png" alt="dc (12)" width="357" height="84" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-12.png 357w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-12-300x71.png 300w" sizes="(max-width: 357px) 100vw, 357px" /></a>

Now, by inspection, we obtain the Jacobian:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-13.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-13.png"><img loading="lazy" class="alignnone size-full wp-image-606" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-13.png" alt="dc (13)" width="271" height="32" /></a>  
<a name="ptp-kmatrix"></a>  
[Compute The K Matrix](#ptp-top)  
Lastly, to solve the constraint we need to compute the values for A (I use the name K) and b:

> See the &#8220;Equality Constraints&#8221; post for the derivation of the A matrix and b vector.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png"><img loading="lazy" class="alignnone size-full wp-image-573" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png" alt="ptpc (1)" width="169" height="131" /></a>

The b vector is fairly straight forward to compute. Therefore I&#8217;ll skip that and compute the K matrix symbolically:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-15.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-15.png"><img loading="lazy" class="alignnone wp-image-608 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-15.png" alt="dc (15)" width="789" height="108" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-15.png 789w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-15-300x41.png 300w" sizes="(max-width: 789px) 100vw, 789px" /></a>

Multiplying left to right the first two matrices we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-14.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-14.png"><img loading="lazy" class="alignnone size-full wp-image-607" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-14.png" alt="dc (14)" width="734" height="108" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-14.png 734w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-14-300x44.png 300w" sizes="(max-width: 734px) 100vw, 734px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-16.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-16.png"><img loading="lazy" class="alignnone size-full wp-image-609" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-16.png" alt="dc (16)" width="715" height="88" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-16.png 715w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-16-300x37.png 300w" sizes="(max-width: 715px) 100vw, 715px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-17.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-17.png"><img loading="lazy" class="alignnone size-full wp-image-610" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-17.png" alt="dc (17)" width="813" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-17.png 813w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-17-300x13.png 300w" sizes="(max-width: 813px) 100vw, 813px" /></a>

Finally distributing the last term and pulling out scalar values we get:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-18.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-18.png"><img loading="lazy" class="alignnone size-full wp-image-611" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-18.png" alt="dc (18)" width="834" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-18.png 834w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-18-300x13.png 300w" sizes="(max-width: 834px) 100vw, 834px" /></a>

> Remember the inertia tensor in 2D is a scalar, therefore we can pull it out to the front of the multiplications.

Since n is normalized:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-19.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-19.png"><img loading="lazy" class="alignnone size-full wp-image-612" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-19.png" alt="dc (19)" width="189" height="25" /></a>

We get:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/09/dc-24.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/09/dc-24.png"><img loading="lazy" class="alignnone size-full wp-image-625" src="http://www.dyn4j.org/wp-content/uploads/2010/09/dc-24.png" alt="dc (24)" width="733" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/09/dc-24.png 733w, http://www.dyn4j.org/wp-content/uploads/2010/09/dc-24-300x14.png 300w" sizes="(max-width: 733px) 100vw, 733px" /></a>

Then if we perform the matrix multiplication in the other terms:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/nrrn.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/nrrn.png"><img loading="lazy" class="alignnone size-full wp-image-583" src="http://www.dyn4j.org/wp-content/uploads/2010/07/nrrn.png" alt="nrrn" width="405" height="197" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/nrrn.png 405w, http://www.dyn4j.org/wp-content/uploads/2010/07/nrrn-300x146.png 300w" sizes="(max-width: 405px) 100vw, 405px" /></a>

We obtain (remember the cross product in 2D is a scalar):

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/dc-20.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-20.png"><img loading="lazy" class="alignnone size-full wp-image-613" src="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-20.png" alt="dc (20)" width="660" height="35" srcset="http://www.dyn4j.org/wp-content/uploads/2010/07/dc-20.png 660w, http://www.dyn4j.org/wp-content/uploads/2010/07/dc-20-300x16.png 300w" sizes="(max-width: 660px) 100vw, 660px" /></a>

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.