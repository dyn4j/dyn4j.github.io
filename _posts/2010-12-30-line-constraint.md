---
id: 438
title: Line Constraint
date: 2010-12-30T20:45:04-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=348
permalink: /2010/12/line-constraint/
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
The next equality constraint we will derive is the line constraint. A line constraint is like a prismatic constraint (which will most likely be the next post) except allows rotation about the anchor point. A prismatic constraint constraints the linear motion of the bodies along a line. An example of a prismatic joint might be a roller coaster on the track. The cars cannot translate or rotate except along the track. For simplicity the prismatic constraint we will define is only for straight lines.  
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

What follows is the derivation of the equations needed to solve for a Line constraint.  
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
So the first step is to write out an equation that describes the constraint. A Line Joint should allow the two bodies to only translate along a given line, but should allow them to rotate about an anchor point. In other words:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-3.png"><img loading="lazy" class="alignnone size-full wp-image-682" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-3.png" alt="linec (3)" width="153" height="26" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-3.png 153w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-3-150x26.png 150w" sizes="(max-width: 153px) 100vw, 153px" /></a>

where:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-4.png"><img loading="lazy" class="alignnone size-full wp-image-683" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-4.png" alt="linec (4)" width="536" height="66" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-4.png 536w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-4-300x37.png 300w" sizes="(max-width: 536px) 100vw, 536px" /></a>

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/point-on-line.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/point-on-line.png"><img loading="lazy" class="alignright wp-image-695 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/12/point-on-line.png" alt="point-on-line" width="200" height="150" /></a>

If we examine the equation we can see that this will allow us to constraint the linear motion. This equation states that any motion that is not along the vector u is invalid, because the tangent of that motion projected onto (via the dot product) the u vector will no longer yield 0.

The initial vector u will be supplied in the construction of the constraint. From u, we will obtain the tangent of u, the t vector. Each simulation step we will recompute u from the anchor points and use it along with the saved t vector to determine if the constraint has been violated.

> Notice that this does not constrain the rotation of the bodies about the anchor point however. To also constrain the rotation about the anchor point use a prismatic joint.

<a name="ptp-derivative"></a>  
[The Derivative](#ptp-top)  
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.
> 
> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-5.png"><img loading="lazy" class="alignnone size-full wp-image-684" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-5.png" alt="linec (5)" width="184" height="51" /></a>

By the chain rule:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-6.png"><img loading="lazy" class="alignnone size-full wp-image-685" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-6.png" alt="linec (6)" width="349" height="51" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-6.png 349w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-6-300x44.png 300w" sizes="(max-width: 349px) 100vw, 349px" /></a>

Where the derivative of u:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-7.png"><img loading="lazy" class="alignnone size-full wp-image-686" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-7.png" alt="linec (7)" width="452" height="167" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-7.png 452w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-7-300x111.png 300w" sizes="(max-width: 452px) 100vw, 452px" /></a>

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.

And the derivative of t:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-8.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-8.png"><img loading="lazy" class="alignnone size-full wp-image-687" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-8.png" alt="linec (8)" width="158" height="40" /></a>

> Here is one tricky part about this derivation. We know that t, like r in the u derivation, is a fixed length vector under a rotation frame. A vector can only be fixed in one coordinate frame, therefore you must choose one: a or b. I chose b, but either way, as long as the K matrix and b vector derivations are correct it will still solve the constraint.

Substituting these back into the equation creates:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-9.png"><img loading="lazy" class="alignnone size-full wp-image-688" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-9.png" alt="linec (9)" width="639" height="39" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-9.png 639w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-9-300x18.png 300w" sizes="(max-width: 639px) 100vw, 639px" /></a>

Now we need to distribute, and on the last term I&#8217;m going to use the property that dot products are commutative:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-10.png"><img loading="lazy" class="alignnone size-full wp-image-689" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-10.png" alt="linec (10)" width="691" height="39" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-10.png 691w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-10-300x17.png 300w" sizes="(max-width: 691px) 100vw, 691px" /></a>

Now we need to group like terms, but the terms are jumbled. We can use the identity:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-11.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-11.png"><img loading="lazy" class="alignnone size-full wp-image-690" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-11.png" alt="linec (11)" width="238" height="31" /></a>

and the property that dot products are commutative to obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-12.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-12.png"><img loading="lazy" class="alignnone size-full wp-image-691" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-12.png" alt="linec (12)" width="684" height="39" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-12.png 684w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-12-300x17.png 300w" sizes="(max-width: 684px) 100vw, 684px" /></a>

Now we can use the property that the cross product is anti-commutative on the last term to obtain the following. Then we group by like terms:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-13.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-13.png"><img loading="lazy" class="alignnone size-full wp-image-692" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-13.png" alt="linec (13)" width="695" height="148" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-13.png 695w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-13-300x64.png 300w" sizes="(max-width: 695px) 100vw, 695px" /></a>

<a name="ptp-isolate"></a>  
[Isolate The Velocities](#ptp-top)  
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two velocity variables. In fact, there are actually four, the linear and angular velocities of both bodies. To isolate the velocities we will need to employ some identities and matrix math.

All the velocity terms are already ready to be isolated, by employing some matrix math we can obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-14.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-14.png"><img loading="lazy" class="alignnone size-full wp-image-693" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-14.png" alt="linec (14)" width="527" height="89" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-14.png 527w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-14-300x51.png 300w" sizes="(max-width: 527px) 100vw, 527px" /></a>

By inspection the Jacobian is:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-15.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-15.png"><img loading="lazy" class="alignnone size-full wp-image-678" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-15.png" alt="linec (15)" width="402" height="37" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-15.png 402w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-15-300x28.png 300w" sizes="(max-width: 402px) 100vw, 402px" /></a>

<a name="ptp-kmatrix"></a>  
[Compute The K Matrix](#ptp-top)  
Lastly, to solve the constraint we need to compute the values for A (I use the name K) and b:

> See the &#8220;Equality Constraints&#8221; post for the derivation of the A matrix and b vector.

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/07/eqc15.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc15.png"><img loading="lazy" class="alignnone size-full wp-image-553" src="http://www.dyn4j.org/wp-content/uploads/2010/07/eqc15.png" alt="eqc15" width="169" height="131" /></a>

The b vector is fairly straight forward to compute. Therefore I&#8217;ll skip that and compute the K matrix symbolically:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-16.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-16.png"><img loading="lazy" class="alignnone size-full wp-image-679" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-16.png" alt="linec (16)" width="730" height="99" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-16.png 730w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-16-300x41.png 300w" sizes="(max-width: 730px) 100vw, 730px" /></a>

Multiplying left to right the first two matrices we obtain:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-1.png"><img loading="lazy" class="alignnone size-full wp-image-680" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-1.png" alt="linec (1)" width="695" height="80" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-1.png 695w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-1-300x35.png 300w" sizes="(max-width: 695px) 100vw, 695px" /></a>

Multiplying left to right again:

<a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/12/linec-2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-2.png"><img loading="lazy" class="alignnone size-full wp-image-681" src="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-2.png" alt="linec (2)" width="925" height="72" srcset="http://www.dyn4j.org/wp-content/uploads/2010/12/linec-2.png 925w, http://www.dyn4j.org/wp-content/uploads/2010/12/linec-2-300x23.png 300w" sizes="(max-width: 925px) 100vw, 925px" /></a>

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.