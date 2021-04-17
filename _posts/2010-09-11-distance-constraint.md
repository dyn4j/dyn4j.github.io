---
id: 374
title: Distance Constraint
date: 2010-09-11 13:07:48 -0500
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=267
permalink: /2010/09/distance-constraint/
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

What follows is the derivation of the equations needed to solve for a Distance constraint.  

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
So the first step is to write out an equation that describes the constraint. A Distance Joint should allow the two bodies to move and rotate freely, but should keep them at a certain distance from one another. In other words:

$$
C = d - l
$$

which says that the current distance, $$ d $$ and the desired distance, $$ l $$ must be equal to zero.  

<a name="ptp-derivative"></a>  

## The Derivative
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.

> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

First, let's expand $$ d $$ in the constraint:

$$
C = \|\vec{p_a} - \vec{p_b}\| - l
$$

Where $$ \vec{p_a} $$ and $$ \vec{p_b} $$ are the anchor points on the respective bodies.

We can rewrite this equation changing the magnitude to:

$$
C = \sqrt{(\vec{p_a} - \vec{p_b}) \cdot (\vec{p_a} - \vec{p_b})} - l
$$

Since the squared magnitude of a vector is the dot product of the vector and itself.  Now we perform the derivative, but first, let:

$$
\vec{u} = \vec{p_a} - \vec{p_b}
$$

Which gives:

$$
C = \sqrt{\vec{u} \cdot \vec{u}} - l
$$

And now taking the derivative (using the chain rule):

$$
\frac{d(C)}{dt} = \frac{1}{2\sqrt{\vec{u} \cdot \vec{u}}}\frac{d(\vec{u} \cdot \vec{u})}{dt} - 0
$$

by the chain rule again:

$$
\frac{d(C)}{dt} = \frac{1}{2\sqrt{\vec{u} \cdot \vec{u}}}(\vec{u} \cdot \frac{d(\vec{u})}{dt} + \frac{d(\vec{u})}{dt} \cdot \vec{u})
$$

Since the dot product is cumulative and distributive over addition:

$$
\begin{align}
\frac{d(C)}{dt} &= \frac{1}{2\sqrt{\vec{u} \cdot \vec{u}}}2(\vec{u} \cdot \frac{d(\vec{u})}{dt}) \\
&= \frac{\vec{u}}{\sqrt{\vec{u} \cdot \vec{u}}}\cdot \frac{d(\vec{u})}{dt} \\
&= \vec{n} \cdot \frac{d(\vec{u})}{dt}
\end{align}
$$

Note that a vector divided by the square root of its magnitude is that same vector just normalized - i.e. $$ \vec{n} $$.  Now we know that:

$$
\begin{align}
\vec{p_a} &= \vec{c_a}m_a + \vec{r_a}R_a \\
\vec{p_b} &= \vec{c_b}m_b + \vec{r_b}R_b \\
\frac{d(\vec{p_a})}{dt} &= \vec{v_a} + w_a \times \vec{r_a} \\
\frac{d(\vec{p_b})}{dt} &= \vec{v_b} + w_b \times \vec{r_b}
\end{align}
$$

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.

Therefore:

$$
\begin{align}
\frac{d(\vec{u})}{dt} &= \frac{d(\vec{p_a} - \vec{p_b})}{dt} \\
&= \frac{d(\vec{p_a})}{dt} - \frac{d(\vec{p_b})}{dt} \\
&= \vec{v_a} + w_a \times \vec{r_a} - \vec{v_b} - w_b \times \vec{r_b} \\
\end{align}
$$

Giving us:

$$
\frac{d(C)}{dt} = \vec{n} \cdot (\vec{v_a} + w_a \times \vec{r_a} - \vec{v_b} - w_b \times \vec{r_b})
$$

<a name="ptp-isolate"></a> 

## Isolate The Velocities
The next step involves isolating the velocities and identifying the Jacobian. This may be confusing at first because there are two velocity variables. In fact, there are actually four, the linear and angular velocities of both bodies. To isolate the velocities we will need to employ some identities and matrix math.

The linear velocities are already isolated so we can ignore those for now. The angular velocities on the other hand have a pesky cross product. In 3D, we can use the identity that a cross product of two vectors is the same as the multiplication by a skew symmetric matrix and the other vector; see <a href="http://en.wikipedia.org/wiki/Cross_product" target="_blank">here</a>. For 2D, we can do something similar by examining the cross product itself:

$$
\begin{align}
w \times \vec{r} &= \begin{bmatrix} -wr_y \\ wr_x \end{bmatrix} \\
&= \begin{bmatrix} -r_y \\ r_x \end{bmatrix}w \\
&= R_sw
\end{align}
$$

> Remember that the angular velocity in 2D is a scalar.

Removing the cross products using the process above yields:

$$
\frac{d(C)}{dt} = \vec{n} \cdot (\vec{v_a} + R_{sa}w_a - \vec{v_b} - R_{sb}w_b)
$$

Now if we employ some matrix multiplication we can separate the velocities from the known coefficients:

$$
\begin{align}
\frac{d(C)}{dt} &= \vec{n} \cdot (\vec{v_a} + R_{sa}w_a - \vec{v_b} - R_{sb}w_b) \\
&= \vec{n}^T(\vec{v_a} + R_{sa}w_a - \vec{v_b} - R_{sb}w_b) \\
&= \vec{n}^T\begin{bmatrix} I_{2x2} & R_{sa} & -I_{2x2} & -R_{sb} \end{bmatrix} \begin{bmatrix} \vec{v_a} \\ w_a \\ \vec{v_b} \\ w_b \end{bmatrix} \\
&= \begin{bmatrix} \vec{n}^T & \vec{n}^TR_{sa} & -\vec{n}^T & -\vec{n}^TR_{sb} \end{bmatrix} \begin{bmatrix} \vec{v_a} \\ w_a \\ \vec{v_b} \\ w_b \end{bmatrix}
\end{align}
$$

Where $$ I_{2x2} $$ is just a 2x2 identity matrix.

> The dot product of two vectors is the same as multiplying the transpose of the first vector with the second.

Now, by inspection, we obtain the Jacobian:

$$
J = \begin{bmatrix} \vec{n}^T & \vec{n}^TR_{sa} & -\vec{n}^T & -\vec{n}^TR_{sb} \end{bmatrix}
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
JM^{-1}J^T = \begin{bmatrix} \vec{n}^T & \vec{n}^TR_{sa} & -\vec{n}^T & -\vec{n}^TR_{sb} \end{bmatrix}
\begin{bmatrix}
M_a^{-1} & 0 & 0 & 0\\
0 & I_a^{-1} & 0 & 0\\
0 & 0 & M_b^{-1} & 0\\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix}
\begin{bmatrix} \vec{n} \\ R_{sa}^T\vec{n} \\ -\vec{n} \\ -R_{sb}^T\vec{n} \end{bmatrix}
$$

> Note that the transpose of a matrix of matrices is the element wise transpose.  Also note that $$ (AB)^T = B^TA^T $$.

Multiplying left to right the first two matrices we obtain:

$$
JM^{-1}J^T = \begin{bmatrix} \vec{n}^TM_a^{-1} & \vec{n}^TR_{sa}I_a^{-1} & -\vec{n}^TM_b^{-1} & -\vec{n}^TR_{sb}I_b^{-1} \end{bmatrix}
\begin{bmatrix} \vec{n} \\ R_{sa}^T\vec{n} \\ -\vec{n} \\ -R_{sb}^T\vec{n} \end{bmatrix}
$$

Multiplying left to right again:

$$
JM^{-1}J^T = \vec{n}^TM_a^{-1}\vec{n} + \vec{n}^TR_{sa}I_a^{-1}R_{sa}^T\vec{n} + \vec{n}^TM_b^{-1}\vec{n} + \vec{n}^TR_{sb}I_b^{-1}R_{sb}^T\vec{n}
$$

Moving the scalar values ($$ M, I $$) to the front:

$$
JM^{-1}J^T = m_a^{-1}\vec{n}^T\vec{n} + I_a^{-1}\vec{n}^TR_{sa}R_{sa}^T\vec{n} + m_b^{-1}\vec{n}^T\vec{n} + I_b^{-1}\vec{n}^TR_{sb}R_{sb}^T\vec{n}
$$

> Remember the inertia tensor in 2D is a scalar, therefore we can pull it out to the front of the multiplications.

Since n is normalized:

$$
\vec{n}^T\vec{n} = \vec{n} \cdot \vec{n} = 1
$$

We get:

$$
\begin{align}
JM^{-1}J^T &= m_a^{-1} + I_a^{-1}\vec{n}^TR_{sa}R_{sa}^T\vec{n} + m_b^{-1} + I_b^{-1}\vec{n}^TR_{sb}R_{sb}^T\vec{n} \\
&= m_a^{-1} + m_b^{-1} + I_a^{-1}\vec{n}^TR_{sa}R_{sa}^T\vec{n} + I_b^{-1}\vec{n}^TR_{sb}R_{sb}^T\vec{n}
\end{align}
$$

Then if we perform the matrix multiplication in the other terms:

$$
\begin{align}
\vec{n}^TR_sR_s^T\vec{n} &= (-n_xr_y + n_yr_x)R_s^T\vec{n} \\
&= (-n_xr_y + n_yr_x)(-r_yn_x + r_xn_y) \\
&= (-n_xr_y + n_yr_x)(-n_xr_y + n_yr_x) \\
&= (-n_xr_y + n_yr_x)^2 \\
&= (\vec{n} \times \vec{r})^2 \\
\end{align}
$$

We obtain (remember the cross product in 2D is a scalar):

$$
JM^{-1}J^T = m_a^{-1} + m_b^{-1} + I_a^{-1}(\vec{n} \times \vec{r_a})^2 + I_b^{-1}(\vec{n} \times \vec{r_b})^2
$$

Plug the values of the $$ K $$ matrix and $$ \vec{b} $$ vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the $$ K $$ matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the $$ K $$ matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.