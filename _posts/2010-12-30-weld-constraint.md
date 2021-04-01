---
id: 437
title: Weld Constraint
date: 2010-12-30T17:05:41-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=337
permalink: /2010/12/weld-constraint/
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
The next equality constraint we will derive is the weld constraint. A weld constraint can be used to join two bodies at an anchor point in which the bodies must move and rotate together (all DOF are constrained).

> This post will differ slightly from the previous posts. A weld joint is basically a revolute joint + an angle joint. In that case we can use the resulting Jacobians from those posts to skip a bit of the work.

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

What follows is the derivation of the equations needed to solve for a Weld constraint.  
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
Like stated above, the weld constraint is just a combination of two other constraints: point-to-point and angle constraints. As such, we can simply combine the Jacobians we found for those constraints into one Jacobain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-5.png"><img loading="lazy" class="alignnone size-full wp-image-675" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-5.png" alt="weldc (5)" width="237" height="36" /></a>

> See the &#8220;Point-to-Point Constraint&#8221; and &#8220;Angle Constraint&#8221; posts for the derivation of their Jacobians.

<a name="ptp-kmatrix"></a>  
[Compute The K Matrix](#ptp-top)  
Lastly, to solve the constraint we need to compute the values for A (I use the name K) and b:

> See the &#8220;Equality Constraints&#8221; post for the derivation of the A matrix and b vector.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/ptpc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png"><img loading="lazy" class="alignnone size-full wp-image-573" src="http://www.dyn4j.org/wp-content/uploads/2010/07/ptpc-1.png" alt="ptpc (1)" width="169" height="131" /></a>

For this constraint the b vector computation isn&#8217;t as simple as in past constraints. So I&#8217;ll work this out as well:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-6.png"><img loading="lazy" class="alignnone size-full wp-image-676" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-6.png" alt="weldc (6)" width="339" height="179" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-6.png 339w, http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-6-300x158.png 300w" sizes="(max-width: 339px) 100vw, 339px" /></a>

> Notice here that the first element in the b vector is a vector also. This makes the b vector a 3&#215;1 vector instead of the normal 2&#215;1 that we have seen thus far.

Now on to computing the K matrix:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-7.png"><img loading="lazy" class="alignnone size-full wp-image-666" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-7.png" alt="weldc (7)" width="710" height="108" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-7.png 710w, http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-7-300x46.png 300w" sizes="(max-width: 710px) 100vw, 710px" /></a>

Multiplying left to right the first two matrices we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-8.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-8.png"><img loading="lazy" class="alignnone size-full wp-image-667" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-8.png" alt="weldc (8)" width="617" height="88" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-8.png 617w, http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-8-300x43.png 300w" sizes="(max-width: 617px) 100vw, 617px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-9.png"><img loading="lazy" class="alignnone size-full wp-image-669" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-9.png" alt="weldc (9)" width="740" height="54" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-9.png 740w, http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-9-300x22.png 300w" sizes="(max-width: 740px) 100vw, 740px" /></a>

Unlike previous posts, some of the elements in the above matrix are matrices themselves. When we multiply out the elements we&#8217;ll see that the resulting K matrix is actually a 3&#215;3 matrix.

> It makes sense that the K matrix is a 3&#215;3 because the b vector was a 3&#215;1, meaning we have 3 variables to solve for. The b vector and K matrix dimensions must match.

So lets take each element and work them out separately, starting with the first element. We can actually copy the result from the Point-to-Point constraint post since its exactly the same:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-10.png"><img loading="lazy" class="alignnone size-full wp-image-670" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-10.png" alt="weldc (10)" width="753" height="50" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-10.png 753w, http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-10-300x20.png 300w" sizes="(max-width: 753px) 100vw, 753px" /></a>

Now let move on to the second element. If we remember:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-1.png"><img loading="lazy" class="alignnone size-full wp-image-671" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-1.png" alt="weldc (1)" width="138" height="35" /></a>

So multiplying and adding the **vectors** here yields the matrix:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-2.png"><img loading="lazy" class="alignnone size-full wp-image-672" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-2.png" alt="weldc (2)" width="281" height="50" /></a>

Likewise, for the third element:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-3.png"><img loading="lazy" class="alignnone size-full wp-image-673" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-3.png" alt="weldc (3)" width="434" height="27" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-3.png 434w, http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-3-300x19.png 300w" sizes="(max-width: 434px) 100vw, 434px" /></a>

Lastly the last element can be left as is since its just a scalar.

Now adding all these elements back into one big matrix we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/weldc-4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-4.png"><img loading="lazy" class="alignnone size-full wp-image-674" src="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-4.png" alt="weldc (4)" width="730" height="64" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-4.png 730w, http://www.dyn4j.org/wp-content/uploads/2010/12/weldc-4-300x26.png 300w" sizes="(max-width: 730px) 100vw, 730px" /></a>

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.