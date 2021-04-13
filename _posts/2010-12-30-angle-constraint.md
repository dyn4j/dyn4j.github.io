---
id: 377
title: Angle Constraint
date: 2010-12-30T14:45:25-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=330
permalink: /2010/12/angle-constraint/
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
The next equality constraint we will derive is the angle constraint. An angle constraint can be used to join two bodies forcing them to have the same rotation. This particular constraint will be added to other constraints (in later posts) to form more complex constraints.  

  1. [Problem Definition](#ptp-problem)
  2. [Process Overview](#ptp-process)
  3. [Position Constraint](#ptp-position)
  4. [The Derivative](#ptp-derivative)
  5. [Isolate The Velocities](#ptp-isolate)
  6. [Compute The K Matrix](#ptp-kmatrix)

<a name="ptp-problem"></a>  

## Problem Definition  
It's probably good to start with a good definition of what we are trying to accomplish.

We want to take two or more bodies and constrain their motion in some way. For instance, say we want two bodies to only be able to rotate about a common point (Revolute Joint). The most common application are constraints between pairs of bodies. Because we have constrained the motion of the bodies, we must find the correct velocities, so that constraints are satisfied otherwise the integrator would allow the bodies to move forward along their current paths. To do this we need to create equations that allow us to solve for the velocities.

What follows is the derivation of the equations needed to solve for an Angle constraint.  

<a name="ptp-process"></a>  

## Process Overview
Let's review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find $$ J $$, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the $$ K $$ matrix. The $$ K $$ matrix is the $$ A $$ in the $$ A\vec{x} = \vec{b} $$ general form equation.  

<a name="ptp-position"></a>  

## Position Constraint
So the first step is to write out an equation that describes the constraint. An Angle Joint should allow the two bodies to move and freely, but should keep their rotations the same. In other words:

$$
C = R_a - R_b - a_r = 0
$$

which says that the rotation about the center of body a minus the rotation about the center of body b should equal the initial reference angle calculated when the joint was created.  

<a name="ptp-derivative"></a>  

## The Derivative
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.

> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

> As a side note, this is one of the easiest constraints to both derive and implement.

Start by taking the derivative of the position constraint:

$$
\begin{align}
\frac{d(C)}{dt} &= \frac{R_a - R_b - a_r}{dt} \\
&= w_a - w_b - 0 \\
&= w_a - w_b
\end{align}
$$

<a name="ptp-isolate"></a>  

## Isolate The Velocities
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two angular velocity variables. To isolate the velocities we will need to employ some matrix math.

$$
\begin{align}
\frac{d(C)}{dt} &= w_a - w_b \\
&= 0\vec{v_a} + 1w_a - 0\vec{v_b} - 1w_b \\
&= \begin{bmatrix} 0 & 1 & 0 & -1 \end{bmatrix} \begin{bmatrix} \vec{v_a} \\ w_a \\ \vec{v_b} \\ w_b \end{bmatrix}
\end{align}
$$

> Notice that I still included the linear velocities in the equation even though they are not present. This is necessary since the mass matrix is a 4x4 matrix so that we can multiply the matrices in the next step.

Now, by inspection, we obtain the Jacobian:

$$
J = \begin{bmatrix} 0 & 1 & 0 & -1 \end{bmatrix}
$$

<a name="ptp-kmatrix"></a> 

## Compute The K Matrix
Lastly, to solve the constraint we need to compute the values for $$ A $$ (I use the name $$ K $$) and $$ \vec{b} $$:

> See the "Equality Constraints" post for the derivation of the $$ A $$ matrix and $$ \vec{b} $$ vector.

$$
\begin{align}
A\vec{x} &= \vec{b} \\
A &= JM^{-1}J^T \\
\vec{x} &= \vec{\lambda} \\
\vec{b} &= -J\vec{v_i}
\end{align}
$$

The $$ \vec{b} $$ vector is fairly straight forward to compute. Therefore I'll skip that and compute the $$ K $$ matrix symbolically:

$$
JM^{-1}J^T = \begin{bmatrix}
  0 & 1 & 0 & -1
\end{bmatrix}
\begin{bmatrix}
M_a^{-1} & 0 & 0 & 0\\
0 & I_a^{-1} & 0 & 0\\
0 & 0 & M_b^{-1} & 0\\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix}
\begin{bmatrix}
0\\
1\\
0\\
-1
\end{bmatrix}
$$

Multiplying left to right the first two matrices we obtain:

$$
JM^{-1}J^T = \begin{bmatrix}
  0 & I_a^{-1} & 0 & -I_b^{-1}
\end{bmatrix}
\begin{bmatrix}
0\\
1\\
0\\
-1
\end{bmatrix}
$$

Multiplying left to right again:

$$
JM^{-1}J^T = I_a^{-1} + I_b^{-1}
$$

Plug the values of the $$ K $$ matrix and $$ \vec{b} $$ vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the $$ K $$ matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the $$ K $$ matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.