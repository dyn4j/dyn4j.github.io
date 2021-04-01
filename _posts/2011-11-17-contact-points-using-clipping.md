---
id: 394
title: Contact Points Using Clipping
date: 2011-11-17T20:18:44-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=394
permalink: /2011/11/contact-points-using-clipping/
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
  - Physics
tags:
  - Collision Detection
  - Contacts
  - EPA
  - Game Development
  - GJK
  - Physics
  - SAT
---
Many have asked &#8220;How do I get the contact points from GJK?&#8221; or similar on the <a title="SAT" href="http://www.dyn4j.org/2010/01/sat/" target="_blank">SAT</a>, <a title="GJK (Gilbert–Johnson–Keerthi)" href="http://www.dyn4j.org/2010/04/gjk-gilbert-johnson-keerthi/" target="_blank">GJK</a>, and <a title="EPA (Expanding Polytope Algorithm)" href="http://www.dyn4j.org/2010/05/epa-expanding-polytope-algorithm/" target="_blank">EPA</a> posts. I&#8217;ve finally got around to creating a post on this topic. Contact point generation is a vital piece of many applications and is usually the next step after collision detection. Generating **good** contact points is crucial to predictable and life-like iteractions between bodies. In this post I plan to cover a clipping method that is used in <a onclick="javascript:pageTracker._trackPageview('/outgoing/www.box2d.org/');"  href="http://www.box2d.org/">Box2d</a> and [dyn4j](http://www.dyn4j.org/). This is not the only method available and I plan to comment about the other methods near the end of the post.

<!--more-->

<a name="cpg-top"></a>

  1. [Introduction](#cpg-intro)
  2. [Finding the Features](#cpg-find)
  3. [Clipping](#cpg-clip)
  4. [Example 1](#cpg-ex1)
  5. [Example 2](#cpg-ex2)
  6. [Example 3](#cpg-ex3)
  7. [Curved Shapes](#cpg-curve)
  8. [Alternative Methods](#cpg-alt)

<a name="cpg-intro"></a>  
[Introduction](#cpg-top)  
Most collision detection algorithms will return a separation normal and depth. Using this information we can translate the shapes directly to resolve the collision. Doing so does not exhibit real world physical behavior. As such, this isn&#8217;t sufficent for applications that want to model the physical world. To model real world iteractions effectively, we need to know **where** the collision occurred.

Contact points are usually world space points on the colliding shapes/bodies that represent where the collision is taking place. In the real world this would on the edge of two objects where they are touching. However, most simulations run collision detection routines on some interval allowing the objects overlap rather than touch. In this very common scenario, we must infer what the contact(s) should be.

> More than one contact point is typically called a contact manifold or contact patch.

<a name="cpg-find"></a>  
[Finding the Features](#cpg-top)  
The first step is to identify the features of the shapes that are involved in the collision. We can find the collision feature of a shape by finding the farthest vertex in the shape. Then, we look at the adjacent two vertices to determine which edge is the &#8220;closest.&#8221; We determine the closest as the edge who is most perpendicular to the separation normal.

<pre class="lang:default decode:true ">// step 1
// find the farthest vertex in
// the polygon along the separation normal
int c = vertices.length;
for (int i = 0; i &lt; c; i++) {
  double projection = n.dot(v);
  if (projection &gt; max) {
    max = projection;
    index = i;
  }
}

// step 2
// now we need to use the edge that
// is most perpendicular, either the
// right or the left
Vector2 v = vertices[index];
Vector2 v1 = v.next;
Vector2 v0 = v.prev;
// v1 to v
Vector2 l = v - v1;
// v0 to v
Vector2 r = v - v0;
// normalize
l.normalize();
r.normalize();
// the edge that is most perpendicular
// to n will have a dot product closer to zero
if (r.dot(n) &lt;= l.dot(n)) {
  // the right edge is better
  // make sure to retain the winding direction
  return new Edge(v, v0, v);
} else {
  // the left edge is better
  // make sure to retain the winding direction
  return new Edge(v, v, v1);
}
// we return the maximum projection vertex (v)
// and the edge points making the best edge (v and either v0 or v1)</pre>

> Be careful when computing the left and right (l and r in the code above) vectors as they both must point towards the maximum point. If one doesn&#8217;t that edge may always be used since its pointing in the negative direction and the other is pointing in the positive direction.

To obtain the correct feature we must know the direction of the separation normal ahead of time. Does it point from A to B or does it point from B to A? Its recommended that this is fixed, so for this post we will assume that the separation normal always points from A to B.

<pre class="lang:default decode:true ">// find the "best" edge for shape A
Edge e1 = A.best(n);
// find the "best" edge for shape B
Edge e2 = B.best(-n);</pre>

<a name="cpg-clip"></a>  
[Clipping](#cpg-top)  
Now that we have the two edges involved in the collision, we can do a series of line/plane clips to get the contact manifold (all the contact points). To do so we need to identify the reference edge and incident edge. The reference edge is the edge most perpendicular to the separation normal. The reference edge will be used to clip the incident edge vertices to generate the contact manifold.

<pre class="lang:default decode:true ">Edge ref, inc;
boolean flip = false;
if (abs(e1.dot(n)) &lt;= abs(e2.dot(n))) {
  ref = e1;
  inc = e2;
} else {
  ref = e2;
  inc = e1;
  // we need to set a flag indicating that the reference
  // and incident edge were flipped so that when we do the final
  // clip operation, we use the right edge normal
  flip = true;
}</pre>

Now that we have identified the reference and incident edges we can begin clipping points. First we need to clip the incident edge&#8217;s points by the first vertex in the reference edge. This is done by comparing the offset of the first vertex along the reference vector with the incident edge&#8217;s offsets. Afterwards, the result of the previous clipping operation on the incident edge is clipped again using the second vertex of the reference edge. Finally, we check if the remaining points are past the reference edge along the reference edge&#8217;s normal. In all, we perform three clipping operations.

<pre class="lang:default decode:true ">// the edge vector
Vector2 refv = ref.edge;
refv.normalize();

double o1 = refv.dot(ref.v1);
// clip the incident edge by the first
// vertex of the reference edge
ClippedPoints cp = clip(inc.v1, inc.v2, refv, o1);
// if we dont have 2 points left then fail
if (cp.length &lt; 2) return;

// clip whats left of the incident edge by the
// second vertex of the reference edge
// but we need to clip in the opposite direction
// so we flip the direction and offset
double o2 = refv.dot(ref.v2);
ClippedPoints cp = clip(cp[0], cp[1], -refv, -o2);
// if we dont have 2 points left then fail
if (cp.length &lt; 2) return;

// get the reference edge normal
Vector2 refNorm = ref.cross(-1.0);
// if we had to flip the incident and reference edges
// then we need to flip the reference edge normal to
// clip properly
if (flip) refNorm.negate();
// get the largest depth
double max = refNorm.dot(ref.max);
// make sure the final points are not past this maximum
if (refNorm.dot(cp[0]) - max &lt; 0.0) {
  cp.remove(cp[0]);
}
if (refNorm.dot(cp[1]) - max &lt; 0.0) {
  cp.remove(cp[1]);
}
// return the valid points
return cp;</pre>

And the clip method:

<pre class="lang:default decode:true ">// clips the line segment points v1, v2
// if they are past o along n
ClippedPoints clip(v1, v2, n, o) {
  ClippedPoints cp = new ClippedPoints();
  double d1 = n.dot(v1) - o;
  double d2 = n.dot(v2) - o;
  // if either point is past o along n
  // then we can keep the point
  if (d1 &gt;= 0.0) cp.add(v1);
  if (d2 &gt;= 0.0) cp.add(v2);
  // finally we need to check if they
  // are on opposing sides so that we can
  // compute the correct point
  if (d1 * d2 &lt; 0.0) {
    // if they are on different sides of the
    // offset, d1 and d2 will be a (+) * (-)
    // and will yield a (-) and therefore be
    // less than zero
    // get the vector for the edge we are clipping
    Vector2 e = v2 - v1;
    // compute the location along e
    double u = d1 / (d1 - d2);
    e.multiply(u);
    e.add(v1);
    // add the point
    cp.add(e);
  }
}</pre>

> Even though all the examples use box-box collisions, this method will work for any convex polytopes. See the end of the post for details on handling curved shapes.

<div id="attachment_526" style="width: 296px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip1.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip1.png"><img aria-describedby="caption-attachment-526" loading="lazy" class="wp-image-526 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip1.png" alt="Figure 1: A simple box-box collision" width="286" height="211" srcset="http://www.dyn4j.org/wp-content/uploads/2011/11/clip1.png 286w, http://www.dyn4j.org/wp-content/uploads/2011/11/clip1-285x211.png 285w" sizes="(max-width: 286px) 100vw, 286px" /></a>
  
  <p id="caption-attachment-526" class="wp-caption-text">
    Figure 1: A simple box-box collision
  </p>
</div>

<a name="cpg-ex1"></a>  
[Example 1](#cpg-top)  
Its best to start with a simple example explaining the process. Figure 1 shows a box vs. box collision with the collision information listed along with the winding direction of the vertices for both shapes. We have following data to begin with:

<pre>// from the collision detector
// separation normal and depth
normal = (0, -1)
depth = 1</pre>

The first step is to get the &#8220;best&#8221; edges, or the edges that are involved in the collision:

<pre class="">// the "best" edges    ( max ) | (  v1 ) | ( v2 )
//                    ---------+---------+-------
Edge e1 = A.best(n)  = ( 8, 4) | ( 8, 4) | (14, 4)
Edge e2 = B.best(-n) = (12, 5) | (12, 5) | ( 4, 5)</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_527" style="width: 296px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip2.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip2.png"><img aria-describedby="caption-attachment-527" loading="lazy" class="wp-image-527 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip2.png" alt="Figure 2: The &quot;best&quot; edges of figure 1" width="286" height="181" srcset="http://www.dyn4j.org/wp-content/uploads/2011/11/clip2.png 286w, http://www.dyn4j.org/wp-content/uploads/2011/11/clip2-285x181.png 285w" sizes="(max-width: 286px) 100vw, 286px" /></a>
      
      <p id="caption-attachment-527" class="wp-caption-text">
        Figure 2: The &#8220;best&#8221; edges of figure 1
      </p>
    </div>
  </div>
  
  <div class="image">
    Figure 2 highlights the &#8220;best&#8221; edges on the shapes. Once we have found the edges, we need to determine which edge is the reference edge and which is the incident edge:
  </div>
</div>

<pre>e1 = (8, 4) to (14, 4) = (14, 4) - (8, 4) = (6, 0)
e2 = (12, 5) to (4, 5) = (4, 5) - (12, 5) = (-8, 0)
e1Dotn = (6, 0) ·  (0, -1) = 0
e2Dotn = (-8, 0) · (0, -1) = 0
// since the dot product is the same we can choose either one
// using the first edge as the reference will let this example 
// be slightly simpler
ref = e1;
inc = e2;</pre>

Now that we have identified the reference and incident edges we perform the first clipping operation:

<pre>ref.normalize() = (1, 0)
o1 = (1, 0) · (8, 4) = 8
// now we call clip with 
// v1 = inc.v1 = (12, 5)
// v2 = inc.v2 = (4, 5)
// n  = ref    = (1, 0)
// o  = o1     = 8
d1 = (1, 0) · (12, 5) - 8 = 4
d2 = (1, 0) · (4, 5)  - 8 = -4
// we only add v1 to the clipped points since
// its the only one that is greater than or
// equal to zero
cp.add(v1);
// since d1 * d2 = -16 we go into the if block
e = (4, 5) - (12, 5) = (-8, 0)
u = 4 / (4 - -4) = 1/2
e * u + v1 = (-8 * 1/2, 0 * 1/2) + (12, 5) = (8, 5)
// then we add this point to the clipped points
cp.add(8, 5);</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_528" style="width: 266px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip3.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip3.png"><img aria-describedby="caption-attachment-528" loading="lazy" class="wp-image-528 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip3.png" alt="Figure 3: The first clip of example 1" width="256" height="181" /></a>
      
      <p id="caption-attachment-528" class="wp-caption-text">
        Figure 3: The first clip of example 1
      </p>
    </div>
  </div>
  
  <div class="image">
    The first clipping operation removed one point that was outside the clipping plane (i.e. past the offset). But since there was another point on the opposite side of the clipping plane, we compute a new point on the edge and use it as the second point of the result. See figure 3 for an illustration.
  </div>
</div>

Since we still have two points in the ClippedPoints object we can continue and perform the second clipping operation:

<pre>o2 = (1, 0) · (14, 4) = 14
// now we call clip with
// v1 = cp[0] = (12, 5)
// v2 = cp[1] = (8, 5)
// n  = -ref  = (-1, 0)
// o  = -o1   = -14
d1 = (-1, 0) · (12, 5) - -14 = 2
d2 = (-1, 0) · (8, 5)  - -14 = 6
// since both are greater than or equal
// to zero we add both to the clipped
// points object
cp.add(v1);
cp.add(v2);
// since both are positive then we skip
// the if block and return</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_529" style="width: 281px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip4.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip4.png"><img aria-describedby="caption-attachment-529" loading="lazy" class="wp-image-529 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip4.png" alt="Figure 4: The second clip of example 1" width="271" height="181" /></a>
      
      <p id="caption-attachment-529" class="wp-caption-text">
        Figure 4: The second clip of example 1
      </p>
    </div>
  </div>
  
  <div class="image">
    The second clipping operation did not remove any points. Figure 4 shows the clipping plane and the valid and invalid regions. Both points were found to be inside the valid region of the clipping plane. Now we continue to the last clipping operation:
  </div>
</div>

<div class="clear">
</div>

<pre>// compute the reference edge's normal
refNorm = (0, 1)
// we didnt have to flip the reference and incident
// edges so refNorm stays the same
// compute the offset for this clipping operation
max = (0, 1) · (8, 4) = 4
// now we clip the points about this clipping plane, where:
// cp[0] = (12, 5)
// cp[1] = (8, 5)
(0, 1) · (12, 5) - 4 = 1
(0, 1) · (8, 5)  - 4 = 1
// since both points are greater than
// or equal to zero we keep them both</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_530" style="width: 296px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip5.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip5.png"><img aria-describedby="caption-attachment-530" loading="lazy" class="wp-image-530 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip5.png" alt="Figure 5: The final clip of example 1" width="286" height="181" srcset="http://www.dyn4j.org/wp-content/uploads/2011/11/clip5.png 286w, http://www.dyn4j.org/wp-content/uploads/2011/11/clip5-285x181.png 285w" sizes="(max-width: 286px) 100vw, 286px" /></a>
      
      <p id="caption-attachment-530" class="wp-caption-text">
        Figure 5: The final clip of example 1
      </p>
    </div>
  </div>
  
  <div class="image">
    On the final clipping operation we keep both of the points. Figure 5 shows the final clipping operation and the valid region for the points. This ends the clipping operation returning a contact manifold of two points.
  </div>
</div>

<div class="clear">
</div>

<pre>// the collision manifold for example 1
cp[0] = (12, 5)
cp[1] = (8, 5)</pre>

<div id="attachment_531" style="width: 266px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip6.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip6.png"><img aria-describedby="caption-attachment-531" loading="lazy" class="wp-image-531 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip6.png" alt="Figure 6: A more common box-box collision" width="256" height="241" /></a>
  
  <p id="caption-attachment-531" class="wp-caption-text">
    Figure 6: A more common box-box collision
  </p>
</div>

<a name="cpg-ex2"></a>  
[Example 2](#cpg-top)  
The first example was, by far, the simplest. In this example we will see how the last clipping operation is used. Figure 6 shows two boxes in collision, but in a slightly different configuration. We have following data to begin with:

<pre>// from the collision detector
// separation normal and depth
normal = (0, -1)
depth = 1</pre>

The first step is to get the &#8220;best&#8221; edges (the edges that are involved in the collision):

<pre>// the "best" edges    ( max ) | (  v1 ) | ( v2 )
//                    ---------+---------+-------
Edge e1 = A.best(n)  = ( 6, 4) | ( 2, 8) | (6, 4)
Edge e2 = B.best(-n) = (12, 5) | (12, 5) | (4, 5)</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_532" style="width: 266px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip7.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip7.png"><img aria-describedby="caption-attachment-532" loading="lazy" class="wp-image-532 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip7.png" alt="Figure 7: The &quot;best&quot; edges of figure 6" width="256" height="211" /></a>
      
      <p id="caption-attachment-532" class="wp-caption-text">
        Figure 7: The &#8220;best&#8221; edges of figure 6
      </p>
    </div>
  </div>
  
  <div class="image">
    Figure 7 highlights the &#8220;best&#8221; edges on the shapes. Once we have found the edges we need to determine which edge is the reference edge and which is the incident edge:
  </div>
</div>

<div class="clear">
</div>

<pre>e1 = (2, 8) to (6, 4)  = (6, 4) - (2, 8)  = (4, -4)
e2 = (12, 5) to (4, 5) = (4, 5) - (12, 5) = (-8, 0)
e1Dotn = (4, -4) · (0, -1) = 4
e2Dotn = (-8, 0) · (0, -1) = 0
// since the dot product is greater for e1 we will use
// e2 as the reference edge and set the flip variable
// to true
ref = e2;
inc = e1;
flip = true;</pre>

Now that we have identified the reference and incident edges we perform the first clipping operation:

<pre>ref.normalize() = (-1, 0)
o1 = (-1, 0) · (12, 5) = -12
// now we call clip with 
// v1 = inc.v1 = (2, 8)
// v2 = inc.v2 = (6, 4)
// n  = ref    = (-1, 0)
// o  = o1     = -12
d1 = (-1, 0) · (2, 8) - -12 = 10
d2 = (-1, 0) · (6, 4) - -12 = 6
// since both are greater than or equal
// to zero we add both to the clipped
// points object
cp.add(v1);
cp.add(v2);
// since both are positive then we skip
// the if block and return</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_533" style="width: 251px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip8.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip8.png"><img aria-describedby="caption-attachment-533" loading="lazy" class="wp-image-533 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip8.png" alt="Figure 8: The first clip of example 2" width="241" height="211" /></a>
      
      <p id="caption-attachment-533" class="wp-caption-text">
        Figure 8: The first clip of example 2
      </p>
    </div>
  </div>
  
  <div class="image">
    The first clipping operation did not remove any points. Figure 8 shows the clipping plane and the valid and invalid regions. Both points were found to be inside the valid region of the clipping plane. Now for the second clipping operation:
  </div>
</div>

<div class="clear">
</div>

<pre>o1 = (-1, 0) · (4, 5) = -4
// now we call clip with 
// v1 = cp[0] = (2, 8)
// v2 = cp[1] = (6, 4)
// n  = ref   = (1, 0)
// o  = o1    = 4
d1 = (1, 0) · (2, 8) - 4 = -2
d2 = (1, 0) · (6, 4) - 4 = 2
// we only add v2 to the clipped points since
// its the only one that is greater than or
// equal to zero
cp.add(v2);
// since d1 * d2 = -4 we go into the if block
e = (6, 4) - (2, 8) = (4, -4)
u = -2 / (-2 - 2) = 1/2
e * u + v1 = (4 * 1/2, -4 * 1/2) + (2, 8) = (4, 6)
// then we add this point to the clipped points
cp.add(4, 6);</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_534" style="width: 251px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip9.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip9.png"><img aria-describedby="caption-attachment-534" loading="lazy" class="wp-image-534 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip9.png" alt="Figure 9: The second clip of example 2" width="241" height="241" srcset="http://www.dyn4j.org/wp-content/uploads/2011/11/clip9.png 241w, http://www.dyn4j.org/wp-content/uploads/2011/11/clip9-150x150.png 150w, http://www.dyn4j.org/wp-content/uploads/2011/11/clip9-174x174.png 174w" sizes="(max-width: 241px) 100vw, 241px" /></a>
      
      <p id="caption-attachment-534" class="wp-caption-text">
        Figure 9: The second clip of example 2
      </p>
    </div>
  </div>
  
  <div class="image">
    The second clipping operation removed one point that was outside the clipping plane (i.e. past the offset). But since there was another point on the opposite side of the clipping plane, we compute a new point on the edge and use it as the second point of the result. See figure 9 for an illustration. Now we continue to the last clipping operation:
  </div>
</div>

<div class="clear">
</div>

<pre>// compute the reference edge's normal
refNorm = (0, 1)
// since we flipped the reference and incident
// edges we need to negate refNorm
refNorm = (0, -1)
max = (0, -1) · (12, 5) = -5
// now we clip the points about this clipping plane, where:
// cp[0] = (6, 4)
// cp[1] = (4, 6)
(0, -1) · (6, 4) - -5 = 1
(0, -1) · (4, 6) - -5 = -1
// since the second point is negative we remove the point
// from the final list of contact points</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_520" style="width: 281px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip10.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip10.png"><img aria-describedby="caption-attachment-520" loading="lazy" class="wp-image-520 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip10.png" alt="Figure 10: The final clip of example 2" width="271" height="211" /></a>
      
      <p id="caption-attachment-520" class="wp-caption-text">
        Figure 10: The final clip of example 2
      </p>
    </div>
  </div>
  
  <div class="image">
    On the final clipping operation we remove one point. Figure 10 shows the final clipping operation and the valid region for the points. This ends the clipping operation returning a contact manifold of only one point.
  </div>
</div>

<pre>// the collision manifold for example 2
cp[0] = (6, 4)
// removed because it was in the invalid region
cp[1] = null</pre>

<div id="attachment_521" style="width: 281px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip11.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip11.png"><img aria-describedby="caption-attachment-521" loading="lazy" class="wp-image-521 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip11.png" alt="Figure 11: A very common box-box collision" width="271" height="211" /></a>
  
  <p id="caption-attachment-521" class="wp-caption-text">
    Figure 11: A very common box-box collision
  </p>
</div>

<a name="cpg-ex3"></a>  
[Example 3](#cpg-top)  
The last example will show the case where the contact point&#8217;s depth must be adjusted. In the previous two examples, the depth of the contact point has remained valid at 1 unit. For this example we will need to modify the psuedo code slightly. See figure 11.

<div class="figure right">
</div>

<pre>// from the collision detector
// separation normal and depth
normal = (-0.19, -0.98)
depth = 1.7</pre>

The first step is to get the &#8220;best&#8221; edges (the edges that are involved in the collision):

<pre class="">// the "best" edges    ( max ) | (  v1 ) | ( v2 )
//                    ---------+---------+-------
Edge e1 = A.best(n)  = ( 9, 4) | ( 9, 4) | (13, 3)
Edge e2 = B.best(-n) = (12, 5) | (12, 5) | (4, 5)</pre>

<div id="attachment_522" style="width: 281px" class="wp-caption alignright">
  <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip12.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip12.png"><img aria-describedby="caption-attachment-522" loading="lazy" class="wp-image-522 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip12.png" alt="Figure 12: The &quot;best&quot; edges of figure 11" width="271" height="211" /></a>
  
  <p id="caption-attachment-522" class="wp-caption-text">
    Figure 12: The &#8220;best&#8221; edges of figure 11
  </p>
</div>

Figure 12 highlights the &#8220;best&#8221; edges on the shapes. Once we have found the edges we need to determine which edge is the reference edge and which is the incident edge:

<pre>e1 = (9, 4) to (13, 3)  = (13, 3) - (9, 4)  = (4, -1)
e2 = (12, 5) to (4, 5) = (4, 5) - (12, 5) = (-8, 0)
e1Dotn = (4, -1) · (-0.19, -0.98) = -0.22
e2Dotn = (-8, 0) · (-0.19, -0.98) =  1.52
// since the dot product is greater for e2 we will use
// e1 as the reference edge and set the flip variable
// to true
ref = e1;
inc = e2;</pre>

Now that we have identified the reference and incident edges we perform the first clipping operation:

<pre class="">ref.normalize() = (0.97, -0.24)
o1 = (0.97, -0.24) · (9, 4) = 7.77
// now we call clip with 
// v1 = inc.v1 = (12, 5)
// v2 = inc.v2 = (4, 5)
// n  = ref    = (0.97, -0.24)
// o  = o1     = 7.77
d1 = (0.97, -0.24) · (12, 5) - 7.77 = 2.67
d2 = (0.97, -0.24) · (4, 5)  - 7.77 = -5.09
// we only add v1 to the clipped points since
// its the only one that is greater than or
// equal to zero
cp.add(v1);
// since d1 * d2 = -13.5903 we go into the if block
e = (4, 5) - (12, 5) = (-8, 0)
u = 2.67 / (2.67 - -5.09) = 2.67/7.76
e * u + v1 = (-8 * 0.34, 0 * 0.34) + (12, 5) = (9.28, 5)
// then we add this point to the clipped points
cp.add(9.28, 5);</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_523" style="width: 266px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip13.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip13.png"><img aria-describedby="caption-attachment-523" loading="lazy" class="wp-image-523 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip13.png" alt="Figure 13: The first clip of example 3" width="256" height="196" /></a>
      
      <p id="caption-attachment-523" class="wp-caption-text">
        Figure 13: The first clip of example 3
      </p>
    </div>
  </div>
  
  <div class="image">
    The first clipping operation removed one point that was outside the clipping plane (i.e. past the offset). But since there was another point on the opposite side of the clipping plane, compute a new point on the edge and use it as the second point of the result. See figure 13 for an illustration.
  </div>
</div>

Since we still have two points in the ClippedPoints object we can continue and perform the second clipping operation:

<pre>o2 = (0.97, -0.24) · (13, 3) = 11.89
// now we call clip with
// v1 = cp[0] = (12, 5)
// v2 = cp[1] = (9.28, 5)
// n  = -ref  = (-0.97, 0.24)
// o  = -o1   = -11.89
d1 = (-0.97, 0.24) · (12, 5)   - -11.89 = 1.45
d2 = (-0.97, 0.24) · (9.28, 5) - -11.89 = 4.09
// since both are greater than or equal
// to zero we add both to the clipped
// points object
cp.add(v1);
cp.add(v2);
// since both are positive then we skip
// the if block and return</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_524" style="width: 281px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip14.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip14.png"><img aria-describedby="caption-attachment-524" loading="lazy" class="wp-image-524 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip14.png" alt="Figure 14: The second clip of example 3" width="271" height="196" /></a>
      
      <p id="caption-attachment-524" class="wp-caption-text">
        Figure 14: The second clip of example 3
      </p>
    </div>
  </div>
  
  <div class="image">
    The second clipping operation did not remove any points. Figure 14 shows the clipping plane and the valid and invalid regions. Both points were found to be inside the valid region of the clipping plane. Now we continue to the last clipping operation:
  </div>
</div>

<div class="clear">
</div>

<pre>// compute the reference edge's normal
refNorm = (0.24, 0.97)
// we didn't flip the reference and incident
// edges, so dont flip the reference edge normal
max = (0.24, 0.97) · (9, 4) = 6.04
// now we clip the points about this clipping plane, where:
// cp[0] = (12, 5)
// cp[1] = (9.28, 5)
(0.24, 0.97) · (12, 5)   - 6.04 = 1.69
(0.24, 0.97) · (9.28, 5) - 6.04 = 1.04
// both points are in the valid region so we keep them both</pre>

<div class="figure right">
  <div class="image">
    <div id="attachment_525" style="width: 281px" class="wp-caption alignright">
      <a onclick="javascript:pageTracker._trackPageview('/downloads/wp-content/uploads/2011/11/clip15.png');"  href="http://www.dyn4j.org/wp-content/uploads/2011/11/clip15.png"><img aria-describedby="caption-attachment-525" loading="lazy" class="wp-image-525 size-full" src="http://www.dyn4j.org/wp-content/uploads/2011/11/clip15.png" alt="Figure 15: The final clip of example 3" width="271" height="166" /></a>
      
      <p id="caption-attachment-525" class="wp-caption-text">
        Figure 15: The final clip of example 3
      </p>
    </div>
  </div>
  
  <div class="image">
    On the final clipping operation we keep both of the points. Figure 15 shows the final clipping operation and the valid region for the points. This ends the clipping operation returning a contact manifold of two points.
  </div>
</div>

<pre>// the collision manifold for example 3
cp[0] = (12, 5)
cp[1] = (9.28, 5)</pre>

The tricky bit here is the collision depth. The original depth of 1.7 that was computed by the collision detector is only valid for one of the points. If you were to use 1.7 for cp[1], you would over compensate the collision. So, because we may produce a new collision point, which is not a vertex on either shape, we must compute the depth of each of the points that we return. Thankfully, we have already done this when we test if the points are valid in the last clipping operation. The depth for the first point is 1.7, as originally found by the collision detector, and 1.04 for the second point.

<pre class="lang:default decode:true ">// previous psuedo code
//if (refNorm.dot(cp[0]) - max &lt; 0.0) {
// cp[0].valid = false;
//}
//if (refNorm.dot(cp[1]) - max &lt; 0.0) {
// cp[1].valid = false;
//}

// new code, just save the depth
cp[0].depth = refNorm.dot(cp[0]) - max;
cp[1].depth = refNorm.dot(cp[1]) - max;
if (cp[0].depth &lt; 0.0) {
  cp.remove(cp[0]);
}
if (cp[1].depth &lt; 0.0) {
  cp.remove(cp[1]);
}</pre>

&nbsp;

<pre class="">// the revised collision manifold for example 3
// point 1
cp[0].point = (12, 5)
cp[0].depth = 1.69
// point 2
cp[1].point = (9.28, 5)
cp[1].depth = 1.04</pre>

<a name="cpg-curve"></a>  
[Curved Shapes](#cpg-top)  
It&#8217;s apparent by now that this method relies heavily on edge features. This poses a problem for curved shapes like circles since their edge(s) aren&#8217;t represented by vertices. Handling circles can be achieved by simply get the farthest point in the circle, instead of the farthest edge, and using the single point returned as the contact manifold. Capsule shapes can do something similar when the farthest feature is inside the circular regions of the shape, and return an edge when its not.

<a name="cpg-alt"></a>  
[Alternative Methods](#cpg-top)  
An alternative method to clipping is to opt for the expanded shapes route that was discussed in the GJK/EPA posts. The original shapes are expaned/shrunk so that the GJK distance method can be used to detect collisions and obtain the MTV. Since GJK is being used, you can also get the closest points. The closest points can be used to obtain one collision point (<a onclick="javascript:pageTracker._trackPageview('/outgoing/www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&ved=0CC0QFjAB&url=http%3A%2F%2Fbullet.googlecode.com%2Ffiles%2FGDC10_Coumans_Erwin_Contact.pdf&ei=L_zpTqXQGYrL0QHkuJ3qCQ&usg=AFQjCNHIBZSsheNUn88HQtK76H4DRZ1y_Q&sig2=ZEmUtnCap0WpO7zHGQU1QQ');"  href="http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&ved=0CC0QFjAB&url=http%3A%2F%2Fbullet.googlecode.com%2Ffiles%2FGDC10_Coumans_Erwin_Contact.pdf&ei=L_zpTqXQGYrL0QHkuJ3qCQ&usg=AFQjCNHIBZSsheNUn88HQtK76H4DRZ1y_Q&sig2=ZEmUtnCap0WpO7zHGQU1QQ" target="_blank">see this</a>).

Since GJK only gives one collision point per detection, and usually more than one is required (especially for physics), we need to do something else to obtain the other point(s). The following two methods are the most popular:

  1. Cache the points from this iteration and subsequent ones until you have enough points to make a acceptable contact manifold.
  2. Perturb the shapes slightly to obtain more points.

Caching is used by the popular <a onclick="javascript:pageTracker._trackPageview('/outgoing/bulletphysics.org/');"  href="http://bulletphysics.org/">Bullet</a> physics engine and entails saving contact points over multiple iterations and then applying a reduction algorithm once a certain number of points has been reached. The reduction algorithm will typically keep the point of maximum depth and a fixed number of points. The points retained, other than the maximum depth point, will be the combination of points that maximize the contact area.

Perturbing the shapes slightly allows you to obtain all the contact points necessary on every iteration. This causes the shapes to be collision detected many times each iteration instead of once per iteration.