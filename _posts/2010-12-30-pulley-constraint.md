---
id: 376
title: Pulley Constraint
date: 2010-12-30T13:32:42-05:00
author: William Bittle
layout: post
guid: http://www.codezealot.org/?p=300
permalink: /2010/12/pulley-constraint/
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
The next equality constraint we will derive is the pulley constraint. A pulley constraint can be used to join two bodies at a fixed distance. In addition, the constraint can be used to simulate a block-and-tackle.  

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

What follows is the derivation of the equations needed to solve for a Pulley constraint.  

<a name="ptp-process"></a>  

## Process Overview
Let's review the process:

  1. Create a position constraint equation.
  2. Perform the derivative with respect to time to obtain the velocity constraint.
  3. Isolate the velocity.

Using these steps we can ensure that we get the correct velocity constraint. After isolating the velocity we inspect the equation to find $$ J $$, the Jacobian.

> Most constraint solvers today solve on the velocity level. Earlier work solved on the acceleration level.

{% include figure.html name="pulley1.png" caption="A pulley system." %}

Once the Jacobian is found we use that to compute the $$ K $$ matrix. The $$ K $$ matrix is the $$ A $$ in the $$ A\vec{x} = \vec{b} $$ general form equation.  

<a name="ptp-position"></a>  

## Position Constraint
So the first step is to write out an equation that describes the constraint. A Distance Joint should allow the two bodies to move and rotate freely, but should keep them at a certain distance from one another. For a Pulley Joint its similar except that the bodes distance is constrained to two axes. In the middle we will allow the option of a block-and-tackle. Examining the image to the right, we see that there are two bodies: Ba, Bb who have distance constraints that are along axes: Ua, Ub which were formed from the Ground and Body anchor points: GAa, GAb, BAa, BAb.

Given this definition we can see that the direction of Ua and Ub can change if the bodies swing left or right for example.

Unlike the Distance Joint, a Pulley Joint allows the distances from the ground anchors to the body anchors to increase and decrease (the magnitude of Ua and Ub can also change). However, the **total** distance along the two axes must be equal to the initial distance when the joint was created (this is what we are trying to constrain). If we apply some scalar factor (or ratio) to the distances we can simulate a block-and-tackle.

We can represent this constraint by the following equation:

$$
C = C_i - (l_a + rl_b)
$$

Where:

$$
\begin{align}
C_i &= l_a + rl_b \\
l_a &= \|\vec{b_a} - \vec{g_a} \| = \| \vec{u_a} \| = \sqrt{\vec{u_a} \cdot \vec{u_a}} \\
l_b &= \|\vec{b_b} - \vec{g_b} \| = \| \vec{u_b} \| = \sqrt{\vec{u_b} \cdot \vec{u_b}}
\end{align}
$$

Where $$ l_a, \vec{b_a}, \vec{g_a}, \vec{u_a} $$ are the length of Ua, body a's body anchor point, body a's ground anchor point, and the vector Ua respectively.

Likewise $$ l_b, \vec{b_b}, \vec{g_b}, \vec{u_b} $$ are the length of Ub, body b's body anchor point, body b's ground anchor point, and the vector Ub respectively.

$$ C_i $$ is computed once, when the joint is created, to obtain the target **total** length of the pulley.

Finally $$ r $$ is a scalar ratio value that will allow us to simulate a block-and-tackle.

To review, our position constraint calculates the current lengths of the two axes (applying the ratio to one) and subtracts it from the initial to find how much the constraint is violated.  

<a name="ptp-derivative"></a>  

## The Derivative
The next step after defining the position constraint is to perform the derivative with respect to time. This will yield us the velocity constraint.

> The velocity constraint can be found/identified directly, however its encouraged that a position constraint be created first and a derivative be performed to ensure that the velocity constraint is correct.

> Another reason to write out the position constraint is because it can be useful during whats called the position correction step; the step to correct position errors (drift).

Taking the derivative of our position constraint we get:

$$
\begin{align}
\frac{d(C)}{dt} &= 0 - \frac{d(l_a - rl_b)}{dt} \\
&= \frac{d(l_a)}{dt} - r\frac{l_b}{dt}
\end{align}
$$

Now we need to perform the derivative on $$ l_a $$ and $$ l_b $$ which were defined as:

$$
\begin{align}
l_a &= \|\vec{b_a} - \vec{g_a} \| = \| \vec{u_a} \| = \sqrt{\vec{u_a} \cdot \vec{u_a}} \\
l_b &= \|\vec{b_b} - \vec{g_b} \| = \| \vec{u_b} \| = \sqrt{\vec{u_b} \cdot \vec{u_b}}
\end{align}
$$

So let's side step for a minute and perform the derivative of $$ l $$ (since both $$ l_a $$ and $$ l_b $$ will be identical):

$$
\begin{align}
\frac{d(l)}{dt} &= \frac{d(\sqrt{\vec{u} \cdot \vec{u}})}{dt} \\
&= \frac{1}{2}\frac{1}{\sqrt{\vec{u} \cdot \vec{u}}}\frac{d(\vec{u} \cdot \vec{u})}{dt} \\
&= \frac{1}{2}\frac{1}{\sqrt{\vec{u} \cdot \vec{u}}}(\vec{u} \cdot \frac{d\vec{u}}{dt} + \frac{d\vec{u}}{dt} \cdot \vec{u}) \\
&= \frac{1}{\sqrt{\vec{u} \cdot \vec{u}}}(\vec{u} \cdot \frac{d\vec{u}}{dt}) \\
&= \frac{1}{\sqrt{\vec{u} \cdot \vec{u}}}(\vec{u} \cdot (\vec{v} + w \times \vec{r})) \\
&= \frac{\vec{u}^T}{\sqrt{\vec{u} \cdot \vec{u}}}(\vec{v} + w \times \vec{r}) \\
&= \vec{n}^T(\vec{v} + w \times \vec{r}) \\
&= \vec{n}^T\vec{v} + \vec{n}^T(w \times \vec{r}) \\
\end{align}
$$

We needed to use the chain rule in order to fully compute the derivative where the derivative of $$ \vec{u} $$:

$$
\begin{align}
\frac{d(\vec{u})}{dt} &= \frac{d(\vec{b} - \vec{g})}{dt} \\
&= \frac{d((\vec{c_m} + \vec{r}R) - \vec{g})}{dt} \\
&= \vec{v} + w \times \vec{r}
\end{align}
$$

> The derivative of a fixed length vector under a rotation frame is the cross product of the angular velocity with that fixed length vector.

> Note here that the $$ \vec{g} $$ vector (ground anchor) is constant and therefore becomes the zero vector.

In the last few steps I replaced a portion of the equation with:

$$
\vec{n}^T = \frac{\vec{u}^T}{\sqrt{\vec{u} \cdot \vec{u}}}
$$

In addition, I replaced the dot product with a matrix multiplication by:

$$
\begin{align}
\vec{a} \cdot \vec{b} &= a_xb_x + a_yb_y \\
&= \begin{bmatrix} a_x & a_y \end{bmatrix} \begin{bmatrix} b_x \\ b_y \end{bmatrix} \\
&= \vec{a}^T\vec{b}
\end{align}
$$

Now if we substitute back into the original equation we get:

$$
\frac{d(C)}{dt} = -(\vec{n_a}^T\vec{v_a} + \vec{n_a}^T(w \times \vec{r_a}) + r(\vec{n_b}^T\vec{v_b} + \vec{n_b}^T(w_b \times \vec{r_b})))
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
\frac{d(C)}{dt} = -(\vec{n_a}^T\vec{v_a} + \vec{n_a}^TR_{sa}w_a + r(\vec{n_b}^T\vec{v_b} + \vec{n_b}^TR_{sb}w_b))
$$

Now, just to clean up some, if we inspect:

$$
\begin{align}
\vec{n}^TR_s &= \begin{bmatrix} n_x & n_y \end{bmatrix} \begin{bmatrix} -r_y \\ r_x \end{bmatrix} \\
&= -n_xr_y + n_yr_x \\
& = r_xn_y - r_yn_x \\
& = \vec{r} \times \vec{n}
\end{align}
$$

Now replacing what we found above into the original equation (and some clean up):

$$
\begin{align}
\frac{d(C)}{dt} &= -(\vec{n_a}^T\vec{v_a} + (\vec{r_a} \times \vec{n_a})w_a + r(\vec{n_b}^T\vec{v_b} + (\vec{r_b} \times \vec{n_b})w_b)) \\
&= -\vec{n_a}^T\vec{v_a} - (\vec{r_a} \times \vec{n_a})w_a - r\vec{n_b}^T\vec{v_b} - r(\vec{r_b} \times \vec{n_b})w_b)
\end{align}
$$

Now if we employ some matrix multiplication we can separate the velocities from the known coefficients:

$$
\frac{d(C)}{dt} = \begin{bmatrix} -\vec{n_a}^T & -(\vec{r_a} \times \vec{n_a}) & -r\vec{n_b}^T & -r(\vec{r_b} \times \vec{n_b}) \end{bmatrix} \begin{bmatrix} \vec{v_a} \\ w_a \\ \vec{v_b} \\ w_b \end{bmatrix}
$$

Now, by inspection, we obtain the Jacobian:

$$
J = \begin{bmatrix} -\vec{n_a}^T & -(\vec{r_a} \times \vec{n_a}) & -r\vec{n_b}^T & -r(\vec{r_b} \times \vec{n_b}) \end{bmatrix}
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
JM^{-1}J^T = \begin{bmatrix} -\vec{n_a}^T & -(\vec{r_a} \times \vec{n_a}) & -r\vec{n_b}^T & -r(\vec{r_b} \times \vec{n_b}) \end{bmatrix}
\begin{bmatrix}
M_a^{-1} & 0 & 0 & 0\\
0 & I_a^{-1} & 0 & 0\\
0 & 0 & M_b^{-1} & 0\\
0 & 0 & 0 & I_b^{-1}
\end{bmatrix}
\begin{bmatrix} -\vec{n_a} \\ -(\vec{r_a} \times \vec{n_a}) \\ -r\vec{n_b} \\ -r(\vec{r_b} \times \vec{n_b}) \end{bmatrix}
$$

Multiplying left to right the first two matrices we obtain:

$$
JM^{-1}J^T = \begin{bmatrix} -\vec{n_a}^TM_a^{-1} & -(\vec{r_a} \times \vec{n_a})I_a^{-1} & -r\vec{n_b}^TM_b^{-1} & -r(\vec{r_b} \times \vec{n_b})I_b^{-1} \end{bmatrix}
\begin{bmatrix} -\vec{n_a} \\ -(\vec{r_a} \times \vec{n_a}) \\ -r\vec{n_b} \\ -r(\vec{r_b} \times \vec{n_b}) \end{bmatrix}
$$

Multiplying left to right again:

$$
JM^{-1}J^T = \vec{n_a}^TM_a^{-1}\vec{n_a} + (\vec{r_a} \times \vec{n_a})I_a^{-1}(\vec{r_a} \times \vec{n_a}) + r\vec{n_b}^TM_b^{-1}r\vec{n_b} + r(\vec{r_b} \times \vec{n_b})I_b^{-1}r(\vec{r_b} \times \vec{n_b})
$$

If we simplify using:

$$
\begin{align}
\vec{n}^T\vec{n} &= \begin{bmatrix} n_x & n_y \end{bmatrix} \begin{bmatrix} n_x \\ n_y \end{bmatrix} \\
&= n_xn_x + n_yn_y \\
&= \vec{n} \cdot \vec{n} \\
&= 1
\end{align}
$$

> Note that $$ \vec{n} $$ is a normalized vector so the dot product with itself is 1.

> Remember the inertia tensor in 2D is a scalar, therefore we can pull it out to the front of the multiplications.

We arrive at the following:

$$
JM^{-1}J^T = m_a^{-1} + I_a^{-1}(\vec{r_a} \times \vec{n_a})^2 + r^2m_b^{-1} + r^2I_b^{-1}(\vec{r_b} \times \vec{n_b})^2
$$

Plug the values of the $$ K $$ matrix and $$ \vec{b} $$ vector into your linear equation solver and you will get the impulse required to satisfy the constraint.

Note here that if you are using an iterative solver that the $$ K $$ matrix does not change over iterations and as such can be computed once each time step.

Another interesting thing to note is that the $$ K $$ matrix will always be a square matrix with a size equal to the number of degrees of freedom (DOF) removed. This is a good way to check that the derivation was performed correctly.