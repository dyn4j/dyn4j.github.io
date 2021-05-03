---
id: 975
title: A Faster Broadphase in dyn4j 4.0.0
date: 2021-05-02 00:36:59 -0500
author: William Bittle
layout: post
permalink: /2021/05/2021-05-02-a-faster-broadphase-in-dyn4j-4-0-0/
image: /assets/posts/2021-05-02-a-faster-broadphase-in-dyn4j-4-0-0/scene1.png
categories:
  - Collision Detection
  - Game Development
  - Blog
tags:
  - dyn4j
  - Collision Detection
  - Game Development
---

Version 4.0.0 had [a lot of changes](https://github.com/dyn4j/dyn4j/blob/master/RELEASE-NOTES.md#v400---august-29th-2020) to the API to support better extensibility, testability, and maintainability, but the biggest change was the 30-40% improvement in performance.  This type of of performance gain is huge and a boon for sure for all those using the library - but just how was it done?

If you've ever done performance analysis or improvements to a piece of code, you are aware that improving performance by saving one object allocation, for example, is nice, but often not very impactful.  Naturally, if you're able to find lots of those instances, these can add up, but the most impactful performance improvements come from algorithms.  Choosing algorithms that are better suited to the problem, more efficient wrt. complexity, better cache locality, etc.

Specifically, this performance improvement was in the Broadphase collision detection system and how it handles detection from frame to frame.

## Background
First a bit of background.  dyn4j includes a system for detecting collisions between objects.  This system is broken down into three main phases:

* Broadphase
* Narrowphase
* Manifold Generation

Why the 3-phase approach?  The narrowphase algorithms are expensive to run, so if we can reduce the possible set of colliding pairs, then we save a lot of processing time.  If we didn't do this, we'd need to test every object with every other object.  That's $$ O(n^2) $$ tests - very inefficient especially when it's more common to _not_ be colliding than they other way around.

Thus, the broadphase is where we detect all the _potential_ pairs of colliding objects.  More specifically, it returns a set of collision pairs that **may** be colliding.  Those pairs that are not included in this set are **definitely NOT** colliding.  The pairs are handed over to the narrowphase where we find out if they truely are or aren't colliding.  Now, how does it do this?  And how does it do it more efficiently than the narrowphase?

## Broadphase Collision Detection
Broadphase collision detection algorithms center around the idea of choosing a simple bounding shape that encompasses the object.  For example, let's imagine I have a simple square shape and I want to create a bounding shape for it.  I can use any type of shape I want, but clearly the choice will determine the efficiency of the algorithm.  In the below picture you see three different possibilities (these are the more common choices):

{% include figure.html name="bounding-shapes.png" caption="Example Bounding Shapes" %}

The first is a bounding circle.  This bounding shape has very quick collision detection - compare the squared distance between the two objects against the sum of their radii. The downside is that long shapes create huge bounding circles.  If you could guarantee that your shapes were all compact, this might be a good choice, but not for a generic collision detection system that has no idea what objects will look like.

The second is an Axis-Aligned Bounding Box, AABB for short.  It's a rectangle that's always _aligned_ to the x and y axes.  This solves the problem that the bounding circle had where long objects would create large bounding shapes.  However, what happens if that long object is rotated about it's center - it's the same issue as the circle bounding shape.  AABB does better, but maybe not the best.  To test for collision between two AABBs we only need to compare their min/max values - 4 comparisons.

The last is an Oriented Bound Box, or OBB for short.  It's a rectangle that's always _oriented_ with the shape.  If the shape is rotated at 45 degress, then the bounding rectangle is rotated at 45 degrees.  Nice!  This solves our problem of rotated long objects generating huge bounding shapes.  Not so fast - there's a problem with this approach.  To check for collision between two OOBs you have to use more sophisticated routines.  In fact, one of those routines is effectively a narrowphase algorithm - we don't get any benefit out of a broadphase that's as expensive as the narrowphase.

> You may have noticed that the bounding shapes in the image above didn't exactly fit the object.  This was mainly to show the differences in the bounding area, but as we'll see soon, this is actually one of the sources of the performance enhancement being described in the post.

Having an easier collision detection proceedure isn't all the broadphase does - we still need to content with that $$ O(n^2) $$ problem.  We could brute force it by testing everything against everything, but that'll be horribly inefficient.  What can we do?  The answer is to subdivide the problem into smaller and smaller chunks so that when we test the higher level chunk and it's negative, we move on - there's no reason to do any tests against objects inside that chunk.  The image below highlights this hierarchy of chunks:

{% include figure.html name="hierarchy.png" caption="A bounding shape hierarchy" %}

For example, if I'm testing an object's AABB against the purple region in the image above and I detect no collision, there's no reason to test the red, blue, teal, green, and yellow regions since they can't possibly be colliding if the purple region isn't.  If we could build a data structure that would organize the scene in this fashion we could reduce the number of collision tests significantly.  For example, if we could organize the scene into a binary tree structure, the number of tests would then be $$ O(n\log{n}) $$.

## Bounding Shape Expansion
Generating the data structure to do less collision tests isn't a trivial task, but keep in mind that our scene is constantly changing as objects are moving and rotating over time, so keeping it up-to-date is also going to be a challenge.  It must be efficient at updating so that we don't trade one performance issue for another.  To avoid going down the rabbit hole of describing various data structures that can be used in broadphase collision detection, let's just assume that you have one and updates to that data structure aren't cheap.

Enter bounding shape exapansion.  If you recall from the section above where we laid out a couple of options for bounding shapes.  You may have noticed that the bounding shapes for the square didn't fit snug around the square.  This was primarily to highlight the different bounding shapes, but also to draw attention to the fact that they don't _have_ to fit snug.  Imagine I _expand_ the bounding shape for a square and put that expanded bounding shape into the broadphase.  The effect is that when the square moves/rotates, I don't have to update the expanded bounding shape unless it leaves that expanded region.

{% include figure.html name="expanded-bounding-shape.png" caption="An object in it's expanded bounding shape in frame 1 and frame 2" %}

Let's try to understand what we're trying to do here - we want to send less pairs to the narrowphase, but we also want to reduce the number of updates to our data structure that's helping use reduce the number of pair-wise tests we need to perform in the broadphase.  If we choose tighly fitting bounding shapes we get smallest number of collision tests in the broadphase, but every one of those objects that's moving/rotating, the tree will need to be updated every frame.  If we choose super fat bounding shapes we end up doing more collision tests in the broadphase, but we don't have to update the broadphase data structure as often (as described above).

The key then is to strike a balance between expanding a lot and not expanding at all.  This is a configurable property in dyn4j.

## The New Optimization
At this point, we have a broadphase collision detection algorithm that uses a data structure to avoid the $$ O(n^2) $$ number of collision tests, a collision detection test that is far quicker than the narrowphase, and we've chosen an appropriate bounding shape expansion to avoid rebuilding te data structure every frame.  What more can be done?

To take a step back, think about how a simulation evolves over time:

* Detect collisions
* Resolve collisions
* Move objects to new positions

Or something like this:

```java
public void runSimulation() {
    while (true) {
        simulationStep();
    }
}

public void simulationStep() {
    // get ALL broadphase collision pairs
    List<Pair> pairs = broadphase.getPairs();

    // filter broadphase pairs using the narrowphase
    Iterator<Pair> iterator = pairs.iterator();
    while (iterator.hasNext()) {
        Pair pair = iterator.next();
        if (!narrowphase.detect(pair)) {
            // then remove it
            iterator.remove();
        }
    }

    // resolve collisions
    // ...

    // move objects to new positions
    // ...
}
```

This flow would be called for every frame of the simulation.  Thus, for every frame we have to retest everything with everything (reduced by our data structure of course).  this seems like a lot of work, but it make sense - we need to make sure that new collisions are detected and old collisions are no longer handled.  The magic for the improved performance in dyn4j 4.0.x lies in this process.

Imagine that we have the following configuration on frame 1 of our simulation:

{% include figure.html name="scene1.png" caption="Frame 1 of our sample scene" %}

We have three squares with expanded bounding shapes (AABBs in this case).  The purple and teal expanded bounding shapes are overlapping.  The orange object's expanded bounding shape is offset because the orange object moved last frame.  Also imagine the purple object is moving as well, but the teal object is stationary.  In this setup we have 3 object and therefore 4 collision tests to do in the worst case (brute-force).  Purple vs. Teal, Purple vs. Orange, Teal vs. Orange.

> We don't test Purple vs. Teal _and_ Teal vs. Purple as this would give the same result.

Next, imagine the simulation proceeds to frame 2:

{% include figure.html name="scene2.png" caption="Frame 2 of our sample scene" %}

The purple and orange object have moved two units to the left while the teal object stayed stationary.  Notice that the purple object's expanded bounding shape remained the same, but the orange object's expanded bounding shape changed.  Now, think critically here - from the last frame to this frame, what do we **really** need to test?  Everything again?

You've probably already guessed it, but no we don't.  The collision between the purple and teal objects hasn't changed - no reason to test it again.  That said, the orange object's expanded bounding shape _did_ change, so we _have_ to test that.  That means in frame 2 we only do 2 collision tests!  Orange vs. Teal and Orange vs. Purple.  Therefore, the performance enhancement we can make is to track, over time, the collisions between objects in the broadphase and only re-test those that have had their expanded bounding shapes updated.

> **KEY**: Therefore, the performance enhancement we can make is to track, over time, the collisions between objects in the broadphase and only re-test those that have had their expanded bounding shapes updated.

Enhancing our code from before:

```java
// ...
List<Pair> pairs = new ArrayList<Pair>();

public void simulationStep() {
    // get only the NEW broadphase collision pairs
    List<Pair> bpairs = broadphase.getNewPairs();

    // filter broadphase pairs using the narrowphase
    Iterator<Pair> iterator = bpairs.iterator();
    while (iterator.hasNext()) {
        Pair pair = iterator.next();
        if (narrowphase.detect(pair)) {
            // then track it in our cross frame set of pairs
            pairs.add(pair);
        }
    }
    // ...
}
```

Ok, great - this is cool and all, but how do we handle frame 3 of the simulation:

{% include figure.html name="scene3.png" caption="Frame 3 of our sample scene" %}

In this frame, we see that the teal and orange object's bounding shapes have not moved, but the purple object's has.  As a result, we only test Purple vs. Teal and Purple vs. Orange and find neither is colliding.  If the contract for our broadphase is to _only_ return potentially colliding pairs, it would return **nothing**.  But how would we know that the collision between Purple and Teal is no longer happening?

It turns out the answer is pretty simple, as you go through **ALL** the stored pairs, remove those who's bounding shapes are no longer colliding:

```java
// ...
List<Pair> pairs = new ArrayList<Pair>();

public void simulationStep() {
    // get only the NEW broadphase collision pairs
    List<Pair> bpairs = broadphase.getNewPairs();

    // filter broadphase pairs using the narrowphase
    Iterator<Pair> iterator = bpairs.iterator();
    while (iterator.hasNext()) {
        Pair pair = iterator.next();
        if (narrowphase.detect(pair)) {
            // then track it in our cross frame set of pairs
            pairs.add(pair);
        }
    }

    // filter out those that are no longer colliding
    Iterator<Pair> allIterator = pairs.iterator();
    while (allIterator.hasNext()) {
        Pair pair = allIterator.next();
        if (!pair.isBoundingShapeOverlapping()) {
            // then remove it
            allIterator.remove();
        }
    }

    // ...
}
```

You might say at this point, "wait a minute, we're doing collision tests with the expanded bounding shapes again - isn't that even worse?"  It turns out no, the key being that we're not doing it for ALL pairs, only those that are currently tracked as potentially overlapping.  We've changed the algorithm from $$ O(n\log{n}) $$, for example, to $$ O(m\log{n}) $$, where $$ m $$ is the number of objects who's expanded AABBs have been updated.

As a side effect of tracking the collisions from frame to frame, we can reduce allocation by storing the results and reusing those objects for the next frame.  In addition to that we can build APIs that allow a caller to look at all this information outside of the standard listener pattern giving them more opportunity to do things in a simpler manner.

In every test with dyn4j, even those with the majority of objects moving and where they were all grouped together, this simple improvement yielded a 30% increase in performance.
