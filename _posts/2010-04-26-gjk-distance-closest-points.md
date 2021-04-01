---
id: 369
title: 'GJK &#8211; Distance &#038; Closest Points'
date: 2010-04-26T19:23:39-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=153
permalink: /2010/04/gjk-distance-closest-points/
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
  - Collision Detection
  - Game Development
tags:
  - Collision Detection
  - Game Development
  - GJK
---
The [last installment](http://www.dyn4j.org/archives/88) talked about the GJK algorithm as it pertains to collision detection. The original algorithm actually is used to obtain the distance and closest points between two convex shapes.  
<!--more-->

<a name="gjk-top"></a>

  1. [Introduction](#gjk-intro)
  2. [Overview](#gjk-overview)
  3. [Minkowski Sum](#gjk-minkowski)
  4. [The Distance](#gjk-distance)
  5. [Iteration](#gjk-iteration)
  6. [Closest Points](#gjk-closest)
  7. [Convex Combination](#gjk-convexcombination)

<a href="#gjk-top" name="gjk-intro">Introduction</a>  
The algorithm uses much of the same concepts to determine the distance between the shapes. The algorithm is iterative, uses the Minkowski Sum/Difference, looks for the origin, and uses the same support function.

<div id="attachment_510" style="width: 299px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/johnson-figure1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure1.png"><img aria-describedby="caption-attachment-510" loading="lazy" class="wp-image-510 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure1.png" alt="Figure 1: Two Separated Shapes" width="289" height="225" /></a>
  
  <p id="caption-attachment-510" class="wp-caption-text">
    Figure 1: Two Separated Shapes
  </p>
</div>

<a href="#gjk-top" name="gjk-overview">Overview</a>

We know that if the shapes are not colliding that the Minkowski Difference will not contain the origin. Therefore instead of iteratively trying to enclose the origin with the simplex, we will want to generate a simplex that is closest to the origin. The closest simplex will always be on the edge of the Minkowski Difference. The closest simplex for 2D could be either a single point or a line.

<div id="attachment_511" style="width: 251px" class="wp-caption alignleft">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/johnson-figure2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure2.png"><img aria-describedby="caption-attachment-511" loading="lazy" class="wp-image-511 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure2.png" alt="Figure 2: The Minkowski Difference" width="241" height="225" /></a>
  
  <p id="caption-attachment-511" class="wp-caption-text">
    Figure 2: The Minkowski Difference
  </p>
</div>

<a href="#gjk-top" name="gjk-minkowski">Minkowski Sum</a>

Just as we did for the collision detection portion of GJK in the previous post, the algorithm also needs to know the Minkowski Sum (Difference is what I will call it, see the GJK post).

Taking the same shapes from the GJK post and separating them (Figure 1) yeilds the same Minkowski Difference only translated slightly (Figure 2). We notice that the origin is not contained within the Minkowski Difference, therefore there is not a collision.

<a href="#gjk-top" name="gjk-distance">The Distance</a>  
The distance can be calculated by finding the closest point on the Minkowski Difference to the origin. The distance is then the magnitude of the closest point. By inspection, we see that the edge created by the points (-4, -1) and (1, 3) is the closest feature to the origin. Naturally the closest point to the origin is the point on this edge that forms a right angle to the origin. We can calculate the point by:

<pre class="">A = (-4, -1)
B = (1, 3)
// create the line
AB = (1, 3) - (-4, -1) = (5, 4)
AO = (0, 0) - (-4, -1) = (4, 1)
// project AO onto AB
AO.dot(AB) = 4 * 5 + 1 * 4 = 24
// get the length squared
AB.dot(AB) = 5 * 5 + 4 * 4 = 41
// calculate the distance along AB
t = 24 / 41
// calculate the point
AB.mult(t).add(A) = (120 / 41, 96 / 41) + (-4, -1)
                  = (-44 / 41, 55 / 41)
                  ≈ (-1.07, 1.34)
d = (-1.07, 1.34).magnitude() ≈ 1.71
</pre>

This is a simple calculation since we know what points of the Minkowski Difference to use.

<div id="attachment_512" style="width: 251px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/johnson-figure3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure3.png"><img aria-describedby="caption-attachment-512" loading="lazy" class="wp-image-512 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure3.png" alt="Figure 3: The Minimum Distance" width="241" height="225" /></a>
  
  <p id="caption-attachment-512" class="wp-caption-text">
    Figure 3: The Minimum Distance
  </p>
</div>

<a href="#gjk-top" name="gjk-iteration">Iteration</a>

Like the collision detection routine of GJK the distance routine is iterative (and almost identical for that matter). We need to iteratively build a simplex which contains the closest points on the Minkowski Difference to the origin. The points will be obtained using a similar method of choosing a direction, using the support function, and checking for the termination case.

Lets examine some psuedo code:

<pre class="lang:default decode:true">// exactly like the previous post, use whatever 
// initial direction you want, some are more optimal
d = // choose a direction
// obtain the first Minkowski Difference point using
// the direction and the support function
Simplex.add(support(A, B, d));
// like the previous post just negate the
// the prevous direction to get the next point
Simplex.add(support(A, B, -d));
// obtain the point on the current simplex closest 
// to the origin (see above example)
// start the loop
d = ClosestPointToOrigin(Simplex.a, Simplex.b);
while (true) {
  // the direction we get from the closest point is pointing
  // from the origin to the closest point, we need to reverse
  // it so that it points towards the origin
  d.negate();
  // check if d is the zero vector
  if (d.isZero()) {
    // then the origin is on the Minkowski Difference
    // I consider this touching/collision
    return false;
  }
  // obtain a new Minkowski Difference point along
  // the new direction
  c = support(A, B, d);
  // is the point we obtained making progress
  // towards the goal (to get the closest points
  // to the origin)
  double dc = c.dot(d);
  // you can use a or b here it doesn't matter
  // since they will be equally distant from
  // the origin
  double da = Simplex.a.dot(d);
  // tolerance is how accurate you want to be
  if (dc - da &lt; tolerance) {
    // if we haven't made enough progress, 
    // given some tolerance, to the origin, 
    // then we can assume that we are done

    // NOTE: to get the correct distance we
    // need to normalize d then dot it with
    // a or c
    // OR since we know that d is the closest 
    // point to the origin, we can just get 
    // its magnitude
    distance = d.magnitude();
    return true;
  }
  // if we are still getting closer then only keep
  // the points in the simplex that are closest to
  // the origin (we already know that c is closer
  // than both a and b so we only need to choose
  // between these two)
  p1 = ClosestPointToOrigin(Simplex.a, c);
  p2 = ClosestPointToOrigin(c, Simplex.b);
  // getting the closest point on the edges AC and
  // CB allows us to compare the distance between
  // the origin and edge and choose the closer one
  if (p1.magnitude() &lt; p2.magnitude()) {
    Simplex.b = c;
    d = p1;
  } else {
    Simplex.a = c;
    d = p2;
  }
}</pre>

The first few lines look a lot like the previous GJK post. The difference is the building of our simplex. We are using the same idea of a simplex, we use the same support function and roughly the same logic, however, we only keep 2 points at all times (3D would be 3 points) and we find a point on the simplex closest to the origin instead of finding the Voronoi region that the origin lies in.

As we did in the previous post this is best explained by running through an example. Let&#8217;s take the example above from Figure 1 and run through the iterations.

Pre Iteration:

<pre class="">// im going to choose the vector joining the
// centers of the objects as the initial d
d = (11.5, 4.0) - (5.5, 8.5) = (6, -4.5)
Simplex.add(support(A, B, d)) = (9, 9) - (8, 6) = (1, 3)
Simplex.add(support(A, B, -d)) = (4, 11) - (13, 1) = (-9, 10)
// calculate new d (for brevity, we'll just look at figure 4)
d = (1, 3) // then negate
d = (-1, -3)
// start the iterations</pre>

Iteration 1:

<pre class="">// get a new point in this direction
c = support(A, B, d) = (4, 5) - (15, 6) = (-11, -1)
// are we still moving closer to the origin?
dc = 11 + 3 = 14
da = -1 - 9 = -10
// 14 - -10 = 24 not small enough
// by inspection, edge AC [(1, 3) to (-11, -1)] is closer than BC [(-9, 10) to (-11, -1)]
// so keep a and replace b with c
b = c
// use p1 as the next direction
d = p1</pre>

<div class="figure left">
  <div class="image">
    <div id="attachment_514" style="width: 251px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/johnson-figure5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure5.png"><img aria-describedby="caption-attachment-514" loading="lazy" class="wp-image-514 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure5.png" alt="Figure 5: Post Iteration 1 Simplex" width="241" height="209" /></a>
      
      <p id="caption-attachment-514" class="wp-caption-text">
        Figure 5: Post Iteration 1 Simplex
      </p>
    </div>
    
    <div id="attachment_513" style="width: 251px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/johnson-figure4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure4.png"><img aria-describedby="caption-attachment-513" loading="lazy" class="wp-image-513 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure4.png" alt="Figure 4: Pre Iteration Simplex" width="241" height="225" /></a>
      
      <p id="caption-attachment-513" class="wp-caption-text">
        Figure 4: Pre Iteration Simplex
      </p>
    </div>
    
    <p>
      In this first iteration I didn&#8217;t go through the trouble of calculating p because its obviously going to be the end point a. If you performed the real calculation, like the code will do, you will obtain the same result. We notice that even though the closest point is a point already on the simplex, we can still use it as the next direction. We obtain a new point using the new direction and keep the two closest points.
    </p>
  </div>
</div>

Iteration 2:

<pre class="">d = (0.8, -2.4)
// get a new point in this direction
c = support(A, B, d) = (4, 5) - (8, 6) = (-4, -1)
// are we still moving closer to the origin?
dc = -3.2 + 2.4 = -0.8
da = 0.8 - 7.2 = -6.4
// -0.8 - -6.4 = 5.6 not small enough
// by inspection, edge AC [(1, 3) to (-4, -1)] is closer than BC [(-11, -1) to (-4, -1)]
// so keep a and replace b with c
b = c
// use p1 as the next direction
d = p1</pre>

<div id="attachment_515" style="width: 251px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/johnson-figure6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure6.png"><img aria-describedby="caption-attachment-515" loading="lazy" class="wp-image-515 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/johnson-figure6.png" alt="Figure 6: Post Iteration 2 Simplex" width="241" height="209" /></a>
  
  <p id="caption-attachment-515" class="wp-caption-text">
    Figure 6: Post Iteration 2 Simplex
  </p>
</div>

Notice that our simplex is getting closer to the origin.

Iteration 3:

Notice in iteration 3 that d is the closest point to the origin and is the same point we found in the Distance section above.

<pre class="">d = (1.07, -1.34)
// get a new point in this direction
c = support(A, B, d) = (9, 9) - (8, 6) = (1, 3)
// are we still moving closer to the origin?
dc = -1.07 + 4.02 = 2.95
da = -1.07 + 4.02 = 2.95
// 2.95 - 2.95 = 0 i think thats small enough!
// ||d|| = 1.7147886...
// we done!
distance = 1.71
</pre>

We notice that when we terminated the difference in projections was zero. This can only happen with two polygons. If either A or B was a shape with a curved edge the difference in projections would approach zero but not obtain zero. Therefore we use a tolerance to handle curved shapes since the tolerance will also work for polygons.

Another problem curved shapes introduce is that if the chosen tolerance is not large enough the algorithm will never terminate. In this case we add a maximum iterations termination case.

One more problem that this algorithm can run into is if the shapes are actually intersecting. If they are intersecting the algorithm will never terminiate. This isn&#8217;t as big of a problem since most of the time you will determine if the shapes are colliding first anyway. If not, then we must add a check in the while loop for the simplex containing the origin. This can be done by a simple point in triangle test (2D).

<a href="#gjk-top" name="gjk-closest">Closest Points</a>  
In addition to the distance between the two shapes, we can also determine the closest points on the shapes. To do this we need to store additional information as we progress through the algorithm. If we store the points on the shapes that were used to create the Minkowski Difference points we can use them later to determine the closest points.

For instance, we terminated above with the Minkowski Difference points A = (1, 3) and B = (-4, -1). These points were created by the following points on their respective shapes:

<table>
  <tr>
    <th>
    </th>
    
    <th colspan="2">
      Shape Points
    </th>
    
    <th>
    </th>
  </tr>
  
  <tr>
    <th>
    </th>
    
    <th>
      S1
    </th>
    
    <th>
      S2
    </th>
    
    <th>
      Minkowski Point
    </th>
  </tr>
  
  <tr>
    <td>
      A
    </td>
    
    <td>
      (9, 9)
    </td>
    
    <td>
      (8, 6)
    </td>
    
    <td>
      = (1, 3)
    </td>
  </tr>
  
  <tr>
    <td>
      B
    </td>
    
    <td>
      (4, 5)
    </td>
    
    <td>
      (8, 6)
    </td>
    
    <td>
      = (-4, -1)
    </td>
  </tr>
</table>

The points used to create the Minkowski Difference points are not necessarily the closest points. However, using these source points we can calculate the closest points.

<a href="#gjk-top" name="gjk-convexcombination">Convex Combination</a>  
We see that the points from A and B are not the correct closests points. By inspection we can see that the closest point on B is (8, 6) and the closest point on A is roughly (6.75, 7.25). We must do some calculation to obtain the closest points. Here&#8217;s where the definition of a <a onclick="javascript:pageTracker._trackPageview('/outgoing/en.wikipedia.org/wiki/Convex_combination');" title="Convex Combination"  href="http://en.wikipedia.org/wiki/Convex_combination" target="_blank" rel="noopener">Convex Combination</a> comes in:

> CC(S) = ∑<sub>i=1…n</sub> λ<sub>i</sub>P<sub>i</sub> = λ<sub>1</sub>P<sub>1</sub> + … + λ<sub>n</sub>P<sub>n</sub>  
> where P<sub>i</sub>∈S, λ<sub>i</sub>∈R  
> and ∑<sub>i…n</sub> λ<sub>i</sub> = 1  
> where λ<sub>i</sub> >= 0

We can guarantee that the points we attempt to find will be on the simplex since all convex combinations are within the convex hull of the set S. Any positive values for the lambda coefficients ensure we don&#8217;t overstep the bounds of the simplex. But to find the values for lambda, we&#8217;ll need another equation.

Our 2D example then would look like this:

> CC(S) = λ<sub>1</sub>P<sub>1</sub> + λ<sub>2</sub>P<sub>2</sub>

Now, if we say that Q is the closest point to the origin on the termination simplex, then we know that the vector from Q to the origin must be perpendicular to the segment that Q lies on.

> L = B &#8211; A  
> Q · L = 0

If we substitute for Q we obtain:

> (λ<sub>1</sub>A + λ<sub>2</sub>B) · L = 0

We need to solve for λ<sub>1</sub> and λ<sub>2</sub> but to do so we need 2 equations. The second equation comes from the other part of the definition of a convex combination:

> λ<sub>1</sub> + λ<sub>2</sub> = 1

Solving the system of equations we obtain:

> λ<sub>2</sub> = -L · A / (L · L)  
> λ<sub>1</sub> = 1 &#8211; λ<sub>2 </sub>

If we perform this computation on our example above, we get:

> L = (-4, -1) &#8211; (1, 3) = (-5, -4)  
> LdotL = 25 + 16 = 41  
> LdotA = -5 &#8211; 12 = -17  
> λ<sub>2</sub> = 17/41  
> λ<sub>1</sub> = 24/41

After computing λ<sub>1</sub> and λ<sub>2</sub> we can compute the closest points by using the definition of the convex combination again, but using the points that made up the Minkowski Difference points:

> A<sub>closest</sub> = λ<sub>1</sub>A<sub>s1</sub> + λ<sub>2</sub>B<sub>s1</sub>  
> B<sub>closest</sub> = λ<sub>1</sub>A<sub>s2</sub> + λ<sub>2</sub>B<sub>s2</sub>  
> A<sub>closest</sub> = 24/41 \* (9, 9) + 17/41 \* (4, 5) ≈ (6.93, 7.34)  
> B<sub>closest</sub> = 24/41 \* (8, 6) + 17/41 \* (8, 6) = (8, 6)

As we can see we computed the closest points!

There are a couple of problems here we must resolve however.

First, if the Minkowski Difference points A and B are the same point, then L will be the zero vector. This means that later when we divide by the magnitude of L we will divide by zero: not good. What this means is that the closest point to the origin is not on a edge of the Minkowski Difference but is a point. Because of this, the support points that made both A and B are the same, and therefore you can just return the support points of A or B:

<pre class="lang:default decode:true ">if (L.isZero()) {
  Aclosest = A.s1;
  Bclosest = A.s2;
}</pre>

The second problem comes in when either λ<sub>1</sub> or λ<sub>2</sub> is negative. According to the definition of a convex hull, λ must be greater than zero. If λ is negative, this tells us that the support points of the other Minkowski Difference point are the closest points:

<pre class="lang:default decode:true ">if (lambda1 &lt; 0) {
  Aclosest = B.s1;
  Bclosest = B.s2;
} else if (lambda2 &lt; 0) {
  Aclosest = A.s1;
  Bclosest = A.s2;
}</pre>

&nbsp;