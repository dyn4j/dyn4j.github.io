---
id: 438
title: Line Constraint
date: 2010-12-30T20:45:04-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=348
permalink: /2010/12/line-constraint/
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

What follows is the derivation of the equations needed to solve for a Line constraint.  

<a name="ptp-process"></a> 

## Process Overview 
Let's review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find $$ J $$, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

Once the Jacobian is found we use that to compute the K matrix. The K matrix is the A in the $$ A\vec{x} = \vec{b} $$ general form equation.  

<a name="ptp-position"></a>  

## Position Constraint  
So the first step is to write out an equation that describes the constraint. A Line Joint should allow the two bodies to only translate along a given line, but should allow them to rotate about an anchor point. In other words:

$$
C = \vec{t} \cdot \vec{u} = 0
$$

where:

$$
\begin{align}
\vec{u} &= \vec{p_a} - \vec{p_b} = (\vec{c_a}m_a + \vec{r_a}R_a) - (\vec{c_b}m_b + \vec{r_b}R_b) \\
\vec{t} &= \begin{bmatrix}
-u_y \\
u_x
\end{bmatrix}
\end{align}
$$

{% include figure.html name="point-on-line.png" caption="A point constrained to a line." %}

If we examine the equation we can see that this will allow us to constraint the linear motion. This equation states that any motion that is not along the vector $$ \vec{u} $$ is invalid, because the tangent of that motion projected onto (via the dot product) the $$ \vec{u} $$ vector will no longer yield 0.

The initial vector $$ \vec{u} $$ will be supplied in the construction of the constraint. From $$ \vec{u} $$, we will obtain the tangent of $$ \vec{u} $$, the $$ \vec{t} $$ vector. Each simulation step we will recompute $$ \vec{u} $$ from the anchor points and use it along with the saved $$ \vec{t} $$ vector to determine if the constraint has been violated.

> Notice that this does not constrain the rotation of the bodies about the anchor point however. To also constrain the rotation about the anchor point use a prismatic joint.

<a name="ptp-derivative"></a>

## The Derivative  
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.

> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

$$
\frac{d(C)}{dt} = \frac{d(\vec{t} \cdot \vec{u})}{dt}
$$

By the chain rule:

$$
\frac{d(C)}{dt} = \vec{t} \cdot \frac{d(\vec{u})}{dt} + \frac{d(\vec{t})}{dt} \cdot \vec{u} 
$$

Where the derivative of $$ \vec{u} $$:

$$
\begin{align}
\frac{d(\vec{u})}{dt} &= \frac{d(\vec{p_a} - \vec{p_b})}{dt} \\
&= \frac{d(\vec{c_a}m_a + \vec{r_a}R_a) - (\vec{c_b}m_b + \vec{r_b}R_b)}{dt} \\
&= \vec{v_a} + w_a \times \vec{r_a} - \vec{v_b} - w_b \times \vec{r_b}
\end{align}
$$

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.

And the derivative of t:

$$
\frac{d(\vec{t})}{dt} = w_b \times \vec{t}
$$

> Here is one tricky part about this derivation. We know that $$ \vec{t} $$, like $$ \vec{r} $$ in the $$ \vec{u} $$ derivation, is a fixed length vector under a rotation frame. A vector can only be fixed in one coordinate frame, therefore you must choose one: a or b. I chose b, but either way, as long as the K matrix and b vector derivations are correct it will still solve the constraint.

Substituting these back into the equation creates:

$$
\frac{d(C)}{dt} = \vec{t} \cdot (\vec{v_a}+w_a\times\vec{r_a}-\vec{v_b}-w_b\times\vec{r_b}) + (w_b\times\vec{t}) \cdot \vec{u}
$$

Now we need to distribute, and on the last term I'm going to use the property that dot products are commutative:

$$
\frac{d(C)}{dt} = \vec{t} \cdot \vec{v_a} + \vec{t} \cdot  w_a \times \vec{r_a} - \vec{t} \cdot \vec{v_b} - \vec{t} \cdot w_b \times \vec{r_b} + \vec{u} \cdot w_b \times \vec{t}
$$

Now we need to group like terms, but the terms are jumbled. We can use the identity:

$$
\vec{a} \cdot (\vec{b} \times \vec{c}) = (\vec{a} \times \vec{b}) \cdot \vec{c}
$$

and the property that dot products are commutative to obtain:

$$
\frac{d(C)}{dt} = \vec{t} \cdot \vec{v_a} + \vec{r_a} \times  \vec{t} \cdot w_a - \vec{t} \cdot \vec{v_b} - \vec{r_b} \times \vec{t} \cdot w_b + \vec{t} \times \vec{u} \cdot w_b
$$

Now we can use the property that the cross product is anti-commutative on the last term to obtain the following. Then we group by like terms:

$$
\begin{align}
\frac{d(C)}{dt} &= \vec{t} \cdot \vec{v_a} + \vec{r_a} \times  \vec{t} \cdot w_a - \vec{t} \cdot \vec{v_b} - \vec{r_b} \times \vec{t} \cdot w_b - \vec{u} \times \vec{t} \cdot w_b \\
&= \vec{t} \cdot \vec{v_a} + \vec{r_a} \times  \vec{t} \cdot w_a - \vec{t} \cdot \vec{v_b} - (\vec{r_b} \times \vec{t} - \vec{u} \times \vec{t}) \cdot w_b \\
&= \vec{t} \cdot \vec{v_a} + \vec{r_a} \times  \vec{t} \cdot w_a - \vec{t} \cdot \vec{v_b} - (\vec{r_b} + \vec{u}) \times \vec{t} \cdot w_b
\end{align}
$$

<a name="ptp-isolate"></a>  

## Isolate The Velocities  
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two velocity variables. In fact, there are actually four, the linear and angular velocities of both bodies. To isolate the velocities we will need to employ some identities and matrix math.

All the velocity terms are already ready to be isolated, by employing some matrix math we can obtain:

$$
\frac{d(C)}{dt} = \begin{bmatrix} \vec{t}^T & \vec{r_a} \times \vec{t} & -\vec{t}^T & -(\vec{r_b} + \vec{u}) \times \vec{t}
\end{bmatrix} \begin{bmatrix} \vec{v_a} \\ w_a \\ \vec{v_b} \\ w_b \end{bmatrix}
$$

By inspection the Jacobian is:

$$
J = \begin{bmatrix} \vec{t}^T & \vec{r_a} \times \vec{t} & -\vec{t}^T & -(\vec{r_b} + \vec{u}) \times \vec{t}
\end{bmatrix}
$$

<a name="ptp-kmatrix"></a>  

## Compute The K Matrix
Lastly, to solve the constraint we need to compute the values for $$ A $$ (I use the name K) and $$ \vec{b} $$:

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
JM^{-1}J^T = \begin{bmatrix} \vec{t}^T & \vec{r_a} \times \vec{t} & -\vec{t}^T & -(\vec{r_b} + \vec{u}) \times \vec{t}
\end{bmatrix}
\begin{bmatrix}
M_a^{-1} & 0 & 0 & 0\\
0 & I_a^{-1} & 0 & 0\\
0 & 0 & M_b^{-1} & 0\\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix}
\begin{bmatrix} \vec{t} \\ \vec{r_a} \times \vec{t} \\ -\vec{t} \\ -(\vec{r_b} + \vec{u}) \times \vec{t}
\end{bmatrix}
$$

Multiplying left to right the first two matrices we obtain:

$$
JM^{-1}J^T = \begin{bmatrix} \vec{t}^TM_a^{-1} & (\vec{r_a} \times \vec{t})I_a^{-1} & -\vec{t}^TM_b^{-1} & -((\vec{r_b} + \vec{u}) \times \vec{t})I_b^{-1}
\end{bmatrix}
\begin{bmatrix} \vec{t} \\ \vec{r_a} \times \vec{t} \\ -\vec{t} \\ -(\vec{r_b} + \vec{u}) \times \vec{t}
\end{bmatrix}
$$

Multiplying left to right again:

$$
\begin{align}
JM^{-1}J^T &= \vec{t}^TM_a^{-1}\vec{t} + (\vec{r_a} \times \vec{t})I_a^{-1}(\vec{r_a} \times \vec{t}) - \vec{t}^TM_b^{-1}\vec{t} - ((\vec{r_b} + \vec{u}) \times \vec{t})I_b^{-1}((\vec{r_b} + \vec{u}) \times \vec{t}) \\
&= m_a^{-1} + (\vec{r_a} \times \vec{t})^2I_a^{-1} - m_b^{-1} - ((\vec{r_b} + \vec{u}) \times \vec{t})^2I_b^{-1}
\end{align}
$$

Plug the values of the K matrix and b vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the K matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the K matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.