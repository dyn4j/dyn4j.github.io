---
id: 368
title: GJK (Gilbert–Johnson–Keerthi)
date: 2010-04-13T22:12:35-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=88
permalink: /2010/04/gjk-gilbert-johnson-keerthi/
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
Today I&#8217;m going to talk about the other collision detection algorithm packaged with the dyn4j project. You can find a lot of GJK documentation but much of it is really technical mostly because they are research papers. I strongly recommend this <a onclick="javascript:pageTracker._trackPageview('/outgoing/mollyrocket.com/849');"  href="http://mollyrocket.com/849">video tutorial</a> and to be honest you may not even need to read any further after watching. But if you feel you need more information after watching the video please read on.  
<!--more-->

  
<a name="gjk-top"></a>

  1. [Introduction](#gjk-intro)
  2. [Convexity](#gjk-convex)
  3. [Minkowski Sum](#gjk-minkowski)
  4. [The Simplex](#gjk-simplex)
  5. [The Support Function](#gjk-support)
  6. [Creating The Simplex](#gjk-create)
  7. [Determining Collision](#gjk-collision)
  8. [Iteration](#gjk-iteration)
  9. [Checking The Simplex](#gjk-origin)

<a href="#gjk-top" name="gjk-intro">Introduction</a>  
GJK, like SAT, only operates on convex shapes. One of the more attractive features of GJK is that it can support any shape that implements a &#8220;support function&#8221; (we&#8217;ll talk about this later). Therefore, unlike SAT, you don&#8217;t need to handle curved shapes, for example, using special code or algorithms.

GJK is an iterative method but converges very fast and if primed with the last penetration/separation vector can run in near constant time. It&#8217;s a better alternative to SAT for 3D environments because of the number of axes that SAT must test.

GJK&#8217;s original intent was to determine the distance between two convex shapes. GJK can also be used to return collision information for small penetrations and can be supplemented by other algorithms for deeper penetrations.

<a href="#gjk-top" name="gjk-convex">Convexity</a>  
As I said earlier, GJK is an algorithm that can only be used with convex shapes. See my post on [SAT](http://www.dyn4j.org/archives/55#sat-convex) for an explaination of convexity.

<a href="#gjk-top" name="gjk-minkowski">Minkowski Sum</a>  
The GJK algorithm relies heavily on a concept called the Minkowski Sum. The Minkowski Sum conceptually is very easy to understand. Let&#8217;s say you have two shapes, the Minkowski Sum of those shapes is all the points in shape1 added to all the points in shape2:

> A + B = {a + b|a∈A, b∈B}

If both shapes are convex, the resulting shape is convex.

You are probably thinking, &#8220;Ok, thats great, but how does this relate?&#8221; The significance is not in the addition but if we choose instead to do a subtraction:

> A &#8211; B = {a &#8211; b|a∈A, b∈B}

As a side note before we continue, even though we are using a &#8220;difference&#8221; operator this isn&#8217;t called the Minkowski Difference instead it&#8217;s still a Minkowski Sum. For the remainder of the article I will refer to this as the Minkowski Difference just for clarity sake.

Moving on, the key with performing a difference operation in the Minkowski Sum is that:

> **If two shapes are overlapping/intersecting the Minkowski Difference will contain the origin.**

<div id="attachment_496" style="width: 299px" class="wp-caption alignleft">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure1.png"><img aria-describedby="caption-attachment-496" loading="lazy" class="wp-image-496 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure1.png" alt="Figure 1: Two convex shapes intersecting" width="289" height="257" /></a>
  
  <p id="caption-attachment-496" class="wp-caption-text">
    Figure 1: Two convex shapes intersecting
  </p>
</div>

Lets look at an example, take the two shapes in figure 1 and perform the Minkowski Difference on them and you will get the shape in figure 2. Notice that the resulting shape contains the origin. This is because the shapes are intersecting.

Now performing this operation required shape1.vertices.size \* shape2.vertices.size \* 2 subtractions. This is significant because a shape is made up of an infinite number of points. Since both shapes are convex and defined by outermost vertices we only need to perform this operation on the vertices. The great thing about GJK is that you **don&#8217;t** actually have to calculate the Minkowski Difference.

<div id="attachment_497" style="width: 283px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure2.png"><img aria-describedby="caption-attachment-497" loading="lazy" class="wp-image-497 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure2.png" alt="Figure 2: The Minkowski Difference" width="273" height="241" /></a>
  
  <p id="caption-attachment-497" class="wp-caption-text">
    Figure 2: The Minkowski Difference
  </p>
</div>

<a href="#gjk-top" name="gjk-simplex">The Simplex</a>  
We don&#8217;t want to compute the Minkowski Difference. Instead we just want to know whether the Minkowski Difference contains the origin or not. If it does, then we know that the shapes are intersecting, if it doesn&#8217;t, then they aren&#8217;t.

Instead what we can do is iteratively build a polygon inside the Minkowski Difference that attempts to enclose the origin. If the polygon we build contains the origin (and is contained in the Minkowski Difference) then we can say the Minkowski Difference contains the origin. This polygon that we want to build is called the Simplex.

<a href="#gjk-top" name="gjk-support">The Support Function</a>  
So the next question is how do we build the Simplex? The Simplex is built using whats called a Support Function. The support function should return a point inside the Minkowski Difference given the two shapes. We already know that we can take a point from shape1 and a point from shape2 and subtract them to obtain a point in the Minkowski Difference, but we don&#8217;t want it to be the same point every time.

We can ensure that we don&#8217;t get the same point every call to the support function if we make the support function dependent on a direction. In other words, if we make the support function return the farthest point in some direction, we can choose a different direction later to obtain a different point.

Choosing the farthest point in a direction has significance because it creates a simplex who contains a maximum area therefore increasing the chance that the algorithm exits quickly. In addition, we can use the fact that all the points returned this way are on the edge of the Minkowski Difference and therefore if we cannot add a point past the origin along some direction we know that the Minkowski Difference does not contain the origin. This increases the chances of the algorithm exiting quickly in non-intersection cases. More on this later.

<pre class="lang:default decode:true ">public Point support(Shape shape1, Shape shape2, Vector d) {
  // d is a vector direction (doesn't have to be normalized)
  // get points on the edge of the shapes in opposite directions
  Point p1 = shape1.getFarthestPointInDirection(d);
  Point p2 = shape2.getFarthestPointInDirection(d.negative());
  // perform the Minkowski Difference
  Point p3 = p1.subtract(p2);
  // p3 is now a point in Minkowski space on the edge of the Minkowski Difference
  return p3;
}</pre>

<a href="#gjk-top" name="gjk-create">Creating The Simplex</a>

Lets start with an example. Using the shapes in figure 2 and performing the support function 3 times:  
First lets start by using d = (1, 0)

<pre class="lang:default decode:true">p1 = (9, 9);
p2 = (5, 7);
p3 = p1 - p2 = (4, 2);</pre>

Next lets use d = (-1, 0)

<pre class="">p1 = (4, 5);
p2 = (12, 7);
p3 = p1 - p2 = (-8, -2);</pre>

Notice that p1 could have been (4, 5) or (4, 11). Both will produce a point on the edge of the Minkowski Difference.  
Next lets use d = (0, 1)

<pre>p1 = (4, 11);
p2 = (10, 2);
p3 = p1 - p2 = (-6, 9);</pre>

we obtain the Simplex illustrated in Figure 3.

<div id="attachment_498" style="width: 283px" class="wp-caption alignleft">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure3.png"><img aria-describedby="caption-attachment-498" loading="lazy" class="wp-image-498 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure3.png" alt="Figure 3: Example Simplex" width="273" height="241" /></a>
  
  <p id="caption-attachment-498" class="wp-caption-text">
    Figure 3: Example Simplex
  </p>
</div>

<a href="#gjk-top" name="gjk-collision">Determining Collision</a>

We said earlier that we know that the two shapes are intersecting if the simplex in the Minkowski Difference contains the origin. In Figure 3, the Simplex doesn&#8217;t contain the origin, but we know that the two shapes are intersecting. The problem here is that our first guess (at choosing directions) didn&#8217;t yield a Simplex that enclosed the origin.

If instead I choose d = (0, -1) for the third Minkowski Difference direction:

<pre>p1 = (4, 5);
p2 = (5, 7);
p3 = p1 - p2 = (-1, -2);</pre>

This yields the simplex shown in figure 4 and now we contain the origin and can determine that there is a collision.

<div id="attachment_499" style="width: 283px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure4.png"><img aria-describedby="caption-attachment-499" loading="lazy" class="wp-image-499 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure4.png" alt="Figure 4: Example simplex containing the origin" width="273" height="241" /></a>
  
  <p id="caption-attachment-499" class="wp-caption-text">
    Figure 4: Example simplex containing the origin
  </p>
</div>

So, as we have seen, the choice of direction can affect the outcome. We can also see that if we obtain a Simplex that does not contain the origin we can calculate another point and use it instead.

This is where the iterative part of the algorithm comes in. We cannot gaurentee that the first 3 points we choose are going to contain the origin nor can we guarentee that the Minkowski Difference contains the origin. We can modify how we choose the points by only choosing points in the direction of the origin. If we change the way we choose the third Minkowski Difference point to below we can enclose the origin.

<pre>d = ...
a = support(..., d)
d = ...
b = support(..., d)
AB = b - a
AO = ORIGIN - a
d = (AB x AO) x AB
c = support(..., d)</pre>

Because the d that c will be using is dependent on a and b forming a line, we can choose b such that it is as far away from a as possible by using the opposite direction:

<pre>d = ...
a = support(..., d)
b = support(..., -d)
AB = b - a
AO = ORIGIN - a
d = (AB x AO) x AB
c = support(..., d)</pre>

So now we only need to choose d for the first Minkowksi Difference point. There are a number of options here, an arbitrary direction, the direction created by the difference of the shapes centers, etc. Any will work but some are more optimal.

> NOTE: AB stands for &#8220;point A to point B&#8221; which is found by taking B &#8211; A **not** A &#8211; B. This holds for the remainder of the post. AO, AC, etc. all follow this format.

<a href="#gjk-top" name="gjk-iteration">Iteration</a>  
Even though we changed the above to determine collision we still may not get a Simplex that contains the origin in those three steps. We must iteratively create the Simplex such that the Simplex is getting closer to containing the origin. We also need to check for two conditions along the way: 1) does the current simplex contain the origin? and 2) are we able to enclose the origin?

Lets look at the skeleton of the iterative algorithm:

<pre class="lang:default decode:true ">Vector d = // choose a search direction
// get the first Minkowski Difference point
Simplex.add(support(A, B, d));
// negate d for the next point
d.negate();
// start looping
while (true) {
  // add a new point to the simplex because we haven't terminated yet
  Simplex.add(support(A, B, d));
  // make sure that the last point we added actually passed the origin
  if (Simplex.getLast().dot(d) &lt;= 0) {
    // if the point added last was not past the origin in the direction of d
    // then the Minkowski Sum cannot possibly contain the origin since
    // the last point added is on the edge of the Minkowski Difference
    return false;
  } else {
    // otherwise we need to determine if the origin is in
    // the current simplex
    if (Simplex.contains(ORIGIN)) {
      // if it does then we know there is a collision
      return true;
    } else {
      // otherwise we cannot be certain so find the edge who is
      // closest to the origin and use its normal (in the direction
      // of the origin) as the new d and continue the loop
      d = getDirection(Simplex);
    }
  }
}</pre>

Next lets use the skeleton with our example in Figure 1. Lets set our initial direction to the vector from the center of shape1 to the center of shape2:

<pre>d = c2 - c1 = (9, 5) - (5.5, 8.5) = (3.5, -3.5) = (1, -1);
p1 = support(A, B, d) = (9, 9) - (5, 7) = (4, 2);
Simplex.add(p1);
d.negate() = (-1, 1);
</pre>

Then we start the loop:  
Iteration 1

> Note that the following triple product expansion is used:  
> (A x B) x C = B(C.dot(A)) &#8211; A(C.dot(B)) to evaluate the triple product.

<pre>last = support(A, B, d) = (4, 11) - (10, 2) = (-6, 9);
proj = (-6, 9).dot(-1, 1) = 6 + 9 = 15
// we past the origin so check if we contain the origin
// we dont because we are line
// get the new direction by (AB x AO) x AB 
AB = (-6, 9) - (4, 2)  = (-10, 7);
AO = (0, 0) - (-6, 9) = (6, -9);
(AB x AO) x AB = AO(149) - AB(-123) 
               = (894, -1341) - (1230, -861) 
               = (-336, -480)
               = (-0.573, -0.819)
</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_500" style="width: 283px" class="wp-caption alignleft">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure5.png"><img aria-describedby="caption-attachment-500" loading="lazy" class="wp-image-500 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure5.png" alt="Figure 5: The First Iteration" width="273" height="241" /></a>
      
      <p id="caption-attachment-500" class="wp-caption-text">
        Figure 5: The First Iteration
      </p>
    </div>
  </div>
  
  <div class="image">
    Figure 5 shows the resulting simplex after iteration 1. We have a line segment (brown) simplex with the next direction (blue) pointing perpendicular to the line towards the origin. One note, the direction does not need to be normalized (see iteration 2) but I&#8217;m doing it here so we can verify the direction given our scale.
  </div>
</div>

Iteration 2

<div class="clear">
</div>

<pre>last = support(A, B, d) = (4, 5) - (12, 7) = (-8, -2)
proj = (-8, -2).dot(-336, -480) = 2688 + 960 = 3648
// we past the origin so check if we contain the origin
// we dont (see Figure 6a)
// the new direction will be the perp of (4, 2) and (-8, -2)
// and the point (-6, 9) can be removed
AB = (-8, -2) - (4, 2)  = (-12, -4);
AO = (0, 0) - (-8, -2) = (8, 2);
(AB x AO) x AB = AO(160) - AB(-104) 
               = (1280, 320) - (1248, 416) 
               = (32, -96)
               = (0.316, -0.948)
</pre>

<div class="figure left">
  <div class="image">
    <div id="attachment_501" style="width: 283px" class="wp-caption alignleft">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure6a.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure6a.png"><img aria-describedby="caption-attachment-501" loading="lazy" class="wp-image-501 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure6a.png" alt="Figure 6a: The Second Iteration: New Simplex" width="273" height="241" /></a>
      
      <p id="caption-attachment-501" class="wp-caption-text">
        Figure 6a: The Second Iteration: New Simplex
      </p>
    </div>
  </div>
</div>

<div class="figure right">
  <div class="image">
    <div id="attachment_483" style="width: 283px" class="wp-caption alignleft">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure6b.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure6b.png"><img aria-describedby="caption-attachment-483" loading="lazy" class="wp-image-483 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure6b.png" alt="Figure 6b: The Second Iteration: New Simplex And Direction" width="273" height="241" /></a>
      
      <p id="caption-attachment-483" class="wp-caption-text">
        Figure 6b: The Second Iteration: New Simplex And Direction
      </p>
    </div>
  </div>
  
  <div class="image">
    After the second iteration we have not enclosed the origin yet but still cannot conclude that the shapes are not intersecting. In the second iteration we removed the (-6, 9) point because all we need is 3 points at any time and we add a new point at the beginning of every iteration.
  </div>
</div>

Iteration 3

<pre>last = support(A, B, d) = (4, 5) - (5, 7) = (-1, -2)
proj = (-1, -2).dot(32, -96) = -32 + 192 = 160
// we past the origin so check if we contain the origin
// we do (Figure 7)!
</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_499" style="width: 283px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure4.png"><img aria-describedby="caption-attachment-499" loading="lazy" class="wp-image-499 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure4.png" alt="Figure 7: The Third Iteration: Collision Detected" width="273" height="241" /></a>
      
      <p id="caption-attachment-499" class="wp-caption-text">
        Figure 7: The Third Iteration: Collision Detected
      </p>
    </div>
  </div>
  
  <div class="image">
    <a href="#gjk-top" name="gjk-origin">Checking The Simplex</a>
  </div>
</div>

We have glazed over two operations in the algorithm, using just pictures and inspection. One is, how do we know that the current simplex contains the origin? The other being, how do we choose the next direction? In the pseudo code above I made these operations separate for the sake of clarity, but in reality they really should be together since they need to know much of the same information.

We can determine where the origin lies with respect to the simplex by performing a series of plane tests (line tests for 2D) where each test consists of simple dot products. The first case that must be handled is the line segment case. So lets look at the first iteration from the example above. After adding the second point on line 9, the simplex is now a line segment. We can determine if the simplex contains the origin by examining the Voronoi regions (see Figure 8).

<div id="attachment_485" style="width: 235px" class="wp-caption alignleft">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure9.png"><img aria-describedby="caption-attachment-485" loading="lazy" class="wp-image-485 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure9.png" alt="Figure 8: Voronoi Regions" width="225" height="209" /></a>
  
  <p id="caption-attachment-485" class="wp-caption-text">
    Figure 8: Voronoi Regions
  </p>
</div>

The line segment is defined as A to B where A is the last point added to the simplex. We know that both A and B are on the edge of the Minkowski Difference and therefore the origin cannot lie in R1 or R4. We can make this assumption because the check from line 11 returned false indicating that we passed the origin when we obtained our next point. The origin can only lie in either R2 or R3 and since a line segment cannot contain the origin then all that needs to be done is to select a new direction. This can be done, as previously stated, by using the perp of AB in the direction of the origin:

<pre>// the perp of AB in the direction of O can be found by
AB = B - A;
AO = O - A;
perp = (AB x AO) x AB;
</pre>

> The catch here is what happens when O lies on the line? If that happens the perp will be a zero vector and will cause the check on line 11 to fail. This can happen in two places: 1) inside the Minkowski Sum and 2) on the edge of the Minkowski Sum. The latter case indicates a touching contact rather than penetration so you will need to make a decision on whether this is considered a collision or not. In either case, you can use either the left or right hand normal of AB as the new direction.

Now lets examine the second iteration. The second iteration turns our simplex into a triangle (Figure 9).

<div id="attachment_486" style="width: 235px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2010/04/gjk-figure10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure10.png"><img aria-describedby="caption-attachment-486" loading="lazy" class="wp-image-486 size-full" src="http://www.dyn4j.org/wp-content/uploads/2010/04/gjk-figure10.png" alt="Figure 9: Voronoi Regions" width="225" height="209" /></a>
  
  <p id="caption-attachment-486" class="wp-caption-text">
    Figure 9: Voronoi Regions
  </p>
</div>

The white regions do not have to be tested since the origin cannot be past any of those points since each point was added because they passed the check on line 11. R2 cannot contain the origin because the last direction we choose was in the opposite direction. So the only regions to test are R3, R4, and R5. We can perform (AC x AB) x AB to yield the perpendicular vector to AB. Then we perform: ABPerp.dot(AO) to determine if the origin is in region R4.

<pre>AB = (-6, 9) - (-8, -2) = (2, 11)
AC = (4, 2) - (-8, -2) = (12, 4)
// (AC x AB) x AB = AB(AB.dot(AC)) - AC(AB.dot(AB))
ABPerp = AB(68) - AC(125)
       = (136, 748) - (1500, 500)
       = (-1364, 248)
       = (-11, 2)
// compute AO
AO = (0, 0) - (-8, -2) = (8, 2)
ABPerp.dot(AO) = -11 * 8 + 2 * 2 = -84
// its negative so the origin does not lie in R4
</pre>

So with one more test we can determine where the origin lies:

<pre>AB = (-6, 9) - (-8, -2) = (2, 11)
AC = (4, 2) - (-8, -2) = (12, 4)
// (AB x AC) x AC = AC(AC.dot(AB)) - AB(AC.dot(AC))
ACPerp = AC(68) - AB(160)
       = (816, 272) - (320, 1760)
       = (496, -1488)
       = (1, -3)
// compute AO
AO = (0, 0) - (-8, -2) = (8, 2)
ACPerp.dot(AO) = 1 * 8 + -3 * 2 = 2
// its positive so that means the origin lies in R3
</pre>

So we have found that the origin lies in R3 so now we need to select a direction so that we get our next Minkowski Difference point in that direction. This is easy since we know that AC was the line segment whose Voronoi region the origin was contained in:

<pre>(AC x AO) x AC
</pre>

And since we are using points A and C we can get rid of B since we didn&#8217;t use it. The new code becomes:

<pre class="lang:default decode:true ">Vector d = // choose a search direction
// get the first Minkowski Difference point
Simplex.add(support(A, B, d));
// negate d for the next point
d.negate();
// start looping
while (true) {
  // add a new point to the simplex because we haven't terminated yet
  Simplex.add(support(A, B, d));
  // make sure that the last point we added actually passed the origin
  if (Simplex.getLast().dot(d) &lt;= 0) {
    // if the point added last was not past the origin in the direction of d
    // then the Minkowski Sum cannot possibly contain the origin since
    // the last point added is on the edge of the Minkowski Difference
    return false;
  } else {
    // otherwise we need to determine if the origin is in
    // the current simplex
    if (containsOrigin(Simplex, d) {
      // if it does then we know there is a collision
      return true;
    }
  }
}

public boolean containsOrigin(Simplex s, Vector d) {
  // get the last point added to the simplex
  a = Simplex.getLast();
  // compute AO (same thing as -A)
  ao = a.negate();
  if (Simplex.points.size() == 3) {
    // then its the triangle case
    // get b and c
    b = Simplex.getB();
    c = Simplex.getC();
    // compute the edges
    ab = b - a;
    ac = c - a;
    // compute the normals
    abPerp = tripleProduct(ac, ab, ab);
    acPerp = tripleProduct(ab, ac, ac);
    // is the origin in R4
    if (abPerp.dot(ao) &gt; 0) {
      // remove point c
      Simplex.remove(c);
      // set the new direction to abPerp
      d.set(abPerp);
    } else {
      // is the origin in R3
      if (acPerp.dot(ao) &gt; 0) {
        // remove point b
        Simplex.remove(b);
        // set the new direction to acPerp
        d.set(acPerp);
      } else{
        // otherwise we know its in R5 so we can return true
        return true;
      }
    }
  } else {
    // then its the line segment case
    b = Simplex.getB();
    // compute AB
    ab = b - a;
    // get the perp to AB in the direction of the origin
    abPerp = tripleProduct(ab, ao, ab);
    // set the direction to abPerp
    d.set(abPerp);
  }
  return false;
}</pre>

This completes the tutorial for the GJK collision detection algorithm. The original GJK algorithm computed a distance between the two convex shapes. I plan to cover this portion of the algorithm in another post since this post is already way too long. Also, as I said earlier, if you need collision information (normal and depth) you will need to modify the GJK algorithm or supplement it with another algorithm. EPA is one supplement algorithm which I plan to cover in another post. Until next time&#8230;