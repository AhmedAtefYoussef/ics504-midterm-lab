/* Lecture content: L1, L2, L3A. Math is TeX for MathJax; String.raw keeps backslashes. */
window.LECTURES = window.LECTURES || [];

/* ------------------------------------------------------------------ L1 */
LECTURES.push({
  id: 'l1', code: 'L1', short: 'Gradient Descent', title: 'Introduction & Gradient Descent',
  thesis: 'Given data, how does a model find the parameters that give the best predictions? Pick a model, measure its error, then walk downhill on that error.',
  learn: [
    { id: 'learn', title: 'What it means for a machine to learn', html: String.raw`
<p>A toddler sees a handful of cats and dogs and then correctly names animals it has never met. Nobody wrote rules such as "pointy ears plus whiskers means cat". The child pulled the pattern out of examples. <b>Machine learning (ML)</b> gives a computer that same ability: the algorithm <em>infers</em> the rules from data instead of a programmer hand-coding them.</p>
<p>Formally, ML is the study of statistical algorithms that <b>improve automatically through data</b>. Zador (2019) describes learning as extracting structure (statistical regularities) from input data and <em>encoding that structure into the parameters</em> of a model. Hold on to that last phrase. In this course, "the model learned" always means <b>the model found good values for its parameters</b>.</p>
<div class="nest" aria-label="AI contains ML which contains deep learning">
  <div class="nest-ai"><span>Artificial Intelligence</span><small>any technique that makes machines act intelligently</small>
    <div class="nest-ml"><span>Machine Learning</span><small>learns the rules from data</small>
      <div class="nest-dl"><span>Deep Learning</span><small>ML with many-layered neural networks</small></div>
    </div>
  </div>
</div>
<h4>Mitchell's definition: E, T and P</h4>
<p>Tom Mitchell's textbook makes "learning" precise. A program <b>learns</b> from experience <b>E</b> with respect to a task <b>T</b> and a performance measure <b>P</b> if its performance on T, measured by P, improves with E. For a spam filter:</p>
<div class="etp">
  <div><b>E · Experience</b><span>Many emails already tagged "spam" or "not spam".</span></div>
  <div><b>T · Task</b><span>Predict the label of a new, unseen email.</span></div>
  <div><b>P · Performance</b><span>Percentage of emails classified correctly.</span></div>
</div>
<p>Why not just write spam rules by hand? Because spammers keep changing tactics. A learned model can be retrained on fresh examples and adapts by itself.</p>
<div class="note exam"><b>Exam tip</b>Expect to name E, T and P for a scenario. E is always the <em>data</em>, T is what the model <em>outputs</em>, P is a <em>number</em> that says how good the output is.</div>
<div class="note intuition"><b>The anchor question for the semester</b>Given data, how does a model find the parameters that give the best predictions? Every lecture answers one piece of it.</div>
`},
    { id: 'types', title: 'Three ways machines learn', html: String.raw`
<table class="tbl">
<thead><tr><th></th><th>Supervised</th><th>Unsupervised</th><th>Reinforcement</th></tr></thead>
<tbody>
<tr><th>Data</th><td>Labeled: every example has the correct answer</td><td>Unlabeled: features only</td><td>No fixed dataset; an agent interacts with an environment</td></tr>
<tr><th>Feedback</th><td>The true label, for every example</td><td>None</td><td>A reward or penalty after actions</td></tr>
<tr><th>Goal</th><td>Predict the label of new inputs</td><td>Discover structure: groups, anomalies</td><td>Learn actions that maximise long-term reward</td></tr>
<tr><th>Examples</th><td>Spam filter, house prices, face unlock</td><td>Customer segments, fraud as "weird" points</td><td>AlphaGo, robot vacuum</td></tr>
</tbody></table>
<p>Supervised learning splits further by the <em>type of label</em>:</p>
<ul>
<li><b>Classification</b> predicts a <b>category</b>: spam or not, malignant or benign, which digit, will the customer churn.</li>
<li><b>Regression</b> predicts a <b>continuous number</b>: house price, tomorrow's temperature, an exam score.</li>
</ul>
<p>Try the in-class game. Classify each scenario, then read why.</p>
<div class="viz" data-viz="mlTypes"></div>
<div class="note trap"><b>Common trap</b>The bank fraud example <em>sounds</em> supervised because fraud is a "label". But if there are no labeled fraud examples, the model can only flag points that look unusual. That is <b>unsupervised anomaly detection</b>. Always ask: <em>does the data contain the answer?</em></div>
<p class="small">Bonus from the lecture: ChatGPT uses all three. Self-supervised pre-training (predict the next word, so the label comes from the data itself), supervised fine-tuning, and reinforcement learning from human feedback (RLHF).</p>
`},
    { id: 'setup', title: 'The supervised learning setup', html: String.raw`
<p>Every supervised problem starts as a table of historical, labeled examples. Here are houses that already sold:</p>
<table class="tbl tbl-house">
<thead><tr><th class="feat">Area m²</th><th class="feat">Bedrooms</th><th class="feat">Bathrooms</th><th class="lab">Price</th></tr></thead>
<tbody>
<tr><td>200</td><td>3</td><td>2</td><td>$500,000</td></tr>
<tr><td>190</td><td>2</td><td>1</td><td>$450,000</td></tr>
<tr><td>230</td><td>3</td><td>3</td><td>$650,000</td></tr>
<tr><td>180</td><td>1</td><td>1</td><td>$400,000</td></tr>
<tr><td>210</td><td>2</td><td>2</td><td>$550,000</td></tr>
</tbody></table>
<ul>
<li><b>Features</b> \(X\): the known characteristics we predict <em>from</em> (area, bedrooms, bathrooms).</li>
<li><b>Label / target</b> \(y\): what we want to predict (price).</li>
<li>The assumption: \(\text{target} = f(\text{features})\) for some unknown function \(f\). Learning means building an approximation \(\hat f\) from the examples.</li>
</ul>
<h4>Notation used all semester</h4>
<table class="tbl compact">
<tbody>
<tr><td>\(m\)</td><td>number of training examples (rows)</td></tr>
<tr><td>\(n\)</td><td>number of features (columns of \(X\))</td></tr>
<tr><td>\(x^{(j)}\)</td><td>the feature vector of example \(j\) (a row)</td></tr>
<tr><td>\(x^{(j)}_i\)</td><td>the value of feature \(i\) in example \(j\)</td></tr>
<tr><td>\(y^{(j)}\), \(\hat y^{(j)}\)</td><td>true label and predicted label of example \(j\)</td></tr>
<tr><td>\(\beta_i\)</td><td>the parameter (coefficient, weight) attached to feature \(i\)</td></tr>
</tbody></table>
<p>The finished <b>data product</b>: you type in a new house's features, it outputs a predicted selling price.</p>
`},
    { id: 'pillars', title: 'The three pillars of every ML algorithm', html: String.raw`
<p>Every algorithm in this course is the same three decisions. Once you see this, new algorithms stop looking new.</p>
<div class="pillars">
  <div class="pillar"><span class="pn">Representation</span><b>What shape can the model take?</b><p>The hypothesis form, e.g. a line \(\hat y = \beta^\top x\).</p></div>
  <div class="arrow" aria-hidden="true">→</div>
  <div class="pillar"><span class="pn">Evaluation</span><b>How wrong is it?</b><p>A cost (loss) function that turns "fit quality" into one number.</p></div>
  <div class="arrow" aria-hidden="true">→</div>
  <div class="pillar"><span class="pn">Optimization</span><b>How do we improve it?</b><p>A procedure, usually gradient descent, that tunes parameters to minimise the cost.</p></div>
</div>
<table class="tbl">
<thead><tr><th>Algorithm</th><th>Representation</th><th>Evaluation</th><th>Optimization</th></tr></thead>
<tbody>
<tr><td>Linear regression (L1)</td><td>\(\hat y = \beta^\top x\)</td><td>Mean squared error</td><td>Gradient descent</td></tr>
<tr><td>Polynomial / Ridge / Lasso (L2)</td><td>Linear in powers of \(x\)</td><td>MSE + penalty</td><td>Gradient descent</td></tr>
<tr><td>Logistic regression (L3)</td><td>\(\sigma(\beta^\top x)\)</td><td>Log loss</td><td>Gradient descent</td></tr>
<tr><td>Decision tree (L4)</td><td>If-then rules</td><td>Gini / entropy</td><td>Greedy splitting</td></tr>
<tr><td>Random forest (L5)</td><td>Many trees, averaged</td><td>Gini / entropy per tree</td><td>Bootstrap + greedy splitting</td></tr>
</tbody></table>
`},
    { id: 'repr', title: 'Representation: the linear model', html: String.raw`
<p>Linear regression assumes the label is a weighted sum of the features:</p>
<div class="eq">\[\hat y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_n x_n\]</div>
<p>\(\beta_0\) is the <b>intercept</b> (the prediction when every feature is 0). Each \(\beta_i\) is a <b>slope</b>: how much \(\hat y\) changes when \(x_i\) rises by one unit and the others stay fixed.</p>
<h4>The \(x_0 = 1\) trick</h4>
<p>Add a fake feature \(x_0 = 1\) to every example. Then the intercept is just another coefficient and the whole model becomes one sum, which is a <b>dot product</b>:</p>
<div class="eq">\[\hat y = \sum_{i=0}^{n} \beta_i x_i = \beta^\top x \qquad \text{with } x = [1, x_1, \dots, x_n]^\top\]</div>
<p>Stack all \(m\) examples as rows of a <b>design matrix</b> \(X\) (size \(m \times (n+1)\), first column all ones) and every prediction is computed at once:</p>
<div class="eq">\[\hat{\mathbf y} = X\beta,\qquad X=\begin{bmatrix}1 & x^{(1)}_1 & \cdots & x^{(1)}_n\\ 1 & x^{(2)}_1 & \cdots & x^{(2)}_n\\ \vdots & & & \vdots \\ 1 & x^{(m)}_1 & \cdots & x^{(m)}_n\end{bmatrix}\]</div>
<p>This is why the lecture says "write it for all coefficients at once, so a computer can evaluate it in a single step". Matrix form is not decoration; it is how the computation is actually run.</p>
`},
    { id: 'cost', title: 'Evaluation: the cost function', html: String.raw`
<p>Some lines are too shallow, some too steep. To let a computer pick, we need one number that says how bad a line is. Start with the <b>residual</b> (error) of each example, \(\hat y^{(j)} - y^{(j)}\), then square and average:</p>
<div class="eq">\[J(\beta) = \frac{1}{2m}\sum_{j=1}^{m}\left(\hat y^{(j)} - y^{(j)}\right)^2 = \frac{1}{2m}\sum_{j=1}^{m}\Big(\sum_{i=0}^{n}\beta_i x^{(j)}_i - y^{(j)}\Big)^2\]</div>
<h4>Why each piece is there</h4>
<ul>
<li><b>Square</b>: positive and negative errors cannot cancel; large errors are punished much more than small ones; the result is smooth (differentiable) everywhere.</li>
<li><b>\(\frac1m\)</b>: averages, so the cost does not grow just because you have more data.</li>
<li><b>\(\frac12\)</b>: pure convenience. Differentiating the square produces a 2 that cancels it.</li>
</ul>
<p>For linear regression, \(J\) is a <b>convex bowl</b> in \(\beta\): one lowest point, no traps. Each choice of \(\beta\) gives one height on the bowl, and the <b>best parameters are the bottom of the bowl</b>.</p>
<p>Drag the slope below. The intercept is set so the line always passes through the average house, which leaves one free parameter and makes the cost a simple curve you can see.</p>
<div class="viz" data-viz="cost"></div>
<div class="note intuition"><b>What to notice</b>Each vertical red segment is one residual. The cost is the average of their squares (halved). When the line is too shallow or too steep, the residuals grow and you climb the walls of the bowl. The bottom is at \(\beta_1 = 5\) ($5k per m²).</div>
`},
    { id: 'grad', title: 'Deriving the gradient, step by step', html: String.raw`
<p>To walk downhill we need the slope of \(J\) in every parameter direction. Take the partial derivative with respect to one coefficient \(\beta_k\).</p>
<ol class="steps">
<li><span>Start from the cost.</span>\[J(\beta) = \frac{1}{2m}\sum_{j=1}^{m}\left(\hat y^{(j)} - y^{(j)}\right)^2\]</li>
<li><span>Chain rule: derivative of a square is 2 × inside × derivative of inside.</span>\[\frac{\partial J}{\partial \beta_k} = \frac{1}{2m}\sum_{j=1}^{m} 2\left(\hat y^{(j)} - y^{(j)}\right)\frac{\partial \hat y^{(j)}}{\partial \beta_k}\]</li>
<li><span>Inside \(\hat y^{(j)} = \sum_i \beta_i x_i^{(j)}\), only the term with \(\beta_k\) moves, so its derivative is \(x_k^{(j)}\).</span>\[\frac{\partial \hat y^{(j)}}{\partial \beta_k} = x^{(j)}_k\]</li>
<li><span>The 2 cancels the ½.</span>\[\boxed{\frac{\partial J}{\partial \beta_k} = \frac{1}{m}\sum_{j=1}^{m}\left(\hat y^{(j)} - y^{(j)}\right)x^{(j)}_k}\]</li>
</ol>
<p>The slides write the same thing as \(-\frac1m\sum_j \big(y^{(j)} - \sum_i \beta_i x^{(j)}_i\big)x^{(j)}_k\). Flip the sign inside the bracket and you get the boxed form.</p>
<p><b>Read it in words</b>: the slope in direction \(k\) is the <em>average error, weighted by feature \(k\)</em>. If the model over-predicts on examples where \(x_k\) is large, the gradient is positive and gradient descent will lower \(\beta_k\).</p>
<h4>All coefficients at once</h4>
<p>Stack the \(n+1\) partial derivatives into the <b>gradient vector</b>. In matrix form it collapses to one line:</p>
<div class="eq">\[\nabla_\beta J = \begin{bmatrix}\partial J/\partial\beta_0\\ \vdots \\ \partial J/\partial\beta_n\end{bmatrix} = \frac{1}{m}X^\top\left(X\beta - \mathbf y\right)\]</div>
<p>Check the shapes: \(X\beta - \mathbf y\) is \(m\times1\) (one error per example); \(X^\top\) is \((n+1)\times m\); the product is \((n+1)\times 1\), one slope per coefficient.</p>
<div class="note beyond"><b>Beyond the slides: the normal equation</b>Setting the gradient to zero gives \(X^\top X\beta = X^\top \mathbf y\), so \(\beta = (X^\top X)^{-1}X^\top\mathbf y\). This is the "exact formula" the lecture mentions for simple models.</div>
`},
    { id: 'why', title: 'Why gradient descent instead of a formula?', html: String.raw`
<ul>
<li><b>The formula gets slow.</b> \((X^\top X)^{-1}\) means inverting an \((n+1)\times(n+1)\) matrix, roughly \(O(n^3)\) work. With many features this is expensive.</li>
<li><b>The formula can fail.</b> If two features are perfectly correlated, \(X^\top X\) has determinant 0 and no inverse exists.</li>
<li><b>Most models have no formula at all.</b> Logistic regression, SVMs and neural networks have no closed-form solution. Setting their gradient to zero cannot be solved by algebra.</li>
</ul>
<p><b>Gradient descent</b> is the general alternative: start anywhere and repeatedly step downhill until you reach the minimum. It needs only the gradient, which we can always compute. That is why it is "the one optimizer we reuse for almost every model in this course".</p>
`},
    { id: 'gd', title: 'Gradient descent: walking downhill', html: String.raw`
<p>Picture standing on a hillside in fog. You cannot see the valley, but you can feel the slope under your feet. Step in the steepest downhill direction, then repeat. The <b>gradient</b> points in the direction of steepest <em>ascent</em>, so we step in the <em>opposite</em> direction:</p>
<div class="eq">\[\beta_k \;\leftarrow\; \beta_k - \alpha\,\frac{\partial J}{\partial \beta_k}\quad\text{for every }k \qquad\Longleftrightarrow\qquad \beta \leftarrow \beta - \alpha\,\nabla_\beta J\]</div>
<p>\(\alpha\) is the <b>learning rate</b> (step size), a <b>hyperparameter</b> you choose; it is not learned.</p>
<h4>The algorithm</h4>
<ol class="steps plain">
<li>Initialise \(\beta\) (zeros or small random values).</li>
<li>Compute predictions \(\hat{\mathbf y} = X\beta\) and the gradient \(\frac1m X^\top(\hat{\mathbf y} - \mathbf y)\).</li>
<li>Update <em>all</em> coefficients simultaneously: \(\beta \leftarrow \beta - \alpha\nabla J\).</li>
<li>Repeat until a stopping criterion: a maximum number of iterations, the gradient is nearly zero, or \(J\) barely changes between steps.</li>
</ol>
<p>Why does it slow down near the bottom even with a fixed \(\alpha\)? Because the step is \(\alpha \times\) gradient, and the gradient itself shrinks to 0 at the minimum. Steps shorten automatically.</p>
<div class="viz" data-viz="gd1d"></div>
<h4>The learning rate decides everything</h4>
<div class="trio">
<div><b>Too small</b><span>Converges, but takes forever.</span></div>
<div><b>Well chosen</b><span>Converges quickly to the minimum.</span></div>
<div><b>Too large</b><span>Overshoots the bottom, bounces, and can diverge (cost grows).</span></div>
</div>
<p>With two parameters the bowl becomes a landscape you can see from above as contour lines. Click anywhere to start the walk.</p>
<div class="viz" data-viz="gd2d"></div>
<div class="note intuition"><b>Why the zig-zag?</b>When the bowl is a long, narrow valley, the steepest direction points across the valley, not along it. Each step overshoots sideways. Scaling features to similar ranges makes the bowl rounder and gradient descent much faster.</div>
<div class="note beyond"><b>Beyond the slides</b><em>Batch</em> GD uses all \(m\) examples per step (what we derived). <em>Stochastic</em> GD uses one random example, <em>mini-batch</em> GD a small group. They are noisier but far cheaper per step, which is how neural networks are trained.</div>
`},
    { id: 'recipe', title: 'The recipe we reuse all semester', html: String.raw`
<div class="recipe"><span>Pick a model</span><i>→</i><span>Define a loss</span><i>→</i><span>Minimise it with gradient descent</span></div>
<p>Logistic regression, SVMs, the perceptron and neural networks all follow this exact recipe. Only the model and the loss change. Next lecture asks what happens when a model fits the training data <em>too</em> closely.</p>
`},
    { id: 'linalg', title: 'Math toolkit: linear algebra', html: String.raw`
<p>Math is the language ML is written in. Algebra represents data, probability measures uncertainty, and calculus drives optimization.</p>
<table class="tbl">
<thead><tr><th>Object</th><th>What it is</th><th>Notation</th><th>ML example</th></tr></thead>
<tbody>
<tr><td><b>Scalar</b></td><td>a single number</td><td>italic \(a, n, x\)</td><td>learning rate \(\alpha\)</td></tr>
<tr><td><b>Vector</b></td><td>1-D array, an \(n\times1\) matrix</td><td>bold lower-case \(\mathbf v\) or \(\vec v\)</td><td>one student: [height, weight, GPA]</td></tr>
<tr><td><b>Matrix</b></td><td>2-D array, a table of vectors</td><td>bold capital \(\mathbf A\)</td><td>a whole dataset \(X\)</td></tr>
</tbody></table>
<h4>Matrix operations</h4>
<ul>
<li><b>Addition</b> is element-wise and needs equal shapes.</li>
<li><b>Multiplication</b>: \((n\times m)(m\times k) = (n\times k)\). The inner sizes must match. Entry \((i,j)\) is the dot product of row \(i\) of \(A\) with column \(j\) of \(B\). In general \(AB \ne BA\).</li>
<li><b>Transpose</b>: rows become columns, \((A^\top)_{ij} = A_{ji}\); a \(2\times3\) becomes \(3\times2\). Also \((AB)^\top = B^\top A^\top\).</li>
<li><b>Identity</b> \(I\): ones on the diagonal, zeros elsewhere; \(AI = A\). It plays the role of the number 1.</li>
<li><b>Inverse</b>: like the reciprocal \(2\times\frac12 = 1\), \(AA^{-1} = A^{-1}A = I\). Only square matrices with \(\det(A)\ne0\) have one.</li>
</ul>
<div class="eq">\[A=\begin{bmatrix}a&b\\c&d\end{bmatrix},\quad \det(A)=ad-bc,\quad A^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}\]</div>
<p class="small">For the 2×2 inverse: swap \(a\) and \(d\), change the signs of \(b\) and \(c\), divide by the determinant.</p>
<div class="viz" data-viz="matrix"></div>
<h4>Vectors: length, direction, alignment</h4>
<p>A vector is an arrow in \(n\)-dimensional space. Representing every data point as a vector lets us use geometry to find patterns.</p>
<div class="eq">\[\|\mathbf v\| = \sqrt{v_1^2 + \dots + v_n^2},\qquad \|\mathbf v\|^2 = \mathbf v^\top\mathbf v,\qquad \text{unit vector } \hat{\mathbf v} = \frac{\mathbf v}{\|\mathbf v\|}\]</div>
<p>The <b>dot product</b> has two equivalent views:</p>
<div class="eq">\[\mathbf u\cdot\mathbf v = \mathbf u^\top\mathbf v = \sum_i u_i v_i \;(\text{rectangular}) \;=\; \|\mathbf u\|\,\|\mathbf v\|\cos\theta \;(\text{polar})\]</div>
<p>It is always a scalar (\(1\times n\) times \(n\times 1\) gives \(1\times1\)) and it measures <b>alignment</b>. For unit vectors: same direction gives 1 (\(\theta=0°\)), perpendicular (orthogonal) gives 0, opposite gives −1. \(\|\mathbf u\|\cos\theta\) is the length of the <b>projection</b> of \(\mathbf u\) onto \(\mathbf v\).</p>
<div class="viz" data-viz="dot"></div>
<ul>
<li><b>Linear regression</b>: prediction = dot product of the feature vector with the weight vector.</li>
<li><b>KNN</b>: classify a point by its nearest neighbours, measured with the Euclidean norm \(\|\mathbf a - \mathbf b\|\).</li>
<li><b>Word embeddings</b>: "king" and "queen" point in similar directions (high cosine similarity); "king" and "banana" are nearly orthogonal.</li>
<li><b>Classification in feature space</b>: each fruit is a point; a classifier draws a boundary between apples and oranges. Trees, SVMs and logistic regression are all ways of finding such boundaries.</li>
</ul>
`},
    { id: 'calc', title: 'Math toolkit: calculus', html: String.raw`
<p>A derivative is a slope: how fast \(f\) changes when \(x\) changes a little. At a minimum of a smooth function the slope is zero.</p>
<table class="tbl compact"><tbody>
<tr><td>\(\frac{d}{dx}(ax) = a\)</td><td>\(\frac{d}{dx}(kx^2) = 2kx\)</td><td>\(\frac{d}{dx}(x^2)=2x\)</td></tr>
<tr><td>\(\frac{\partial}{\partial\mathbf x}(\mathbf a^\top\mathbf x) = \mathbf a\)</td><td>\(\frac{\partial}{\partial\mathbf x}(\mathbf x^\top\mathbf x) = 2\mathbf x\)</td><td>\(\frac{\partial}{\partial\mathbf x}(\mathbf x^\top A\mathbf x) = (A+A^\top)\mathbf x\)</td></tr>
</tbody></table>
<p>If \(A\) is symmetric, the last rule becomes \(2A\mathbf x\). These vector rules are the scalar rules in disguise: \(ax \to \mathbf a^\top\mathbf x\), \(kx^2 \to \mathbf x^\top A\mathbf x\).</p>
<h4>Minimising by hand</h4>
<p>\(f(x) = (x-2)^2\). Then \(f'(x) = 2(x-2) = 2x - 4\). Set it to 0: \(x^* = 2\) and \(f(x^*) = 0\). Gradient descent finds the same point numerically, which matters when the equation \(f'=0\) cannot be solved by hand.</p>
<h4>Putting the rules to work</h4>
<p>Write the cost in matrix form and expand:</p>
<div class="eq">\[J = \tfrac{1}{2m}(X\beta-\mathbf y)^\top(X\beta-\mathbf y) = \tfrac{1}{2m}\left(\beta^\top X^\top X\beta - 2\mathbf y^\top X\beta + \mathbf y^\top\mathbf y\right)\]</div>
<p>\(X^\top X\) is symmetric, so the \(\mathbf x^\top A\mathbf x\) rule gives \(2X^\top X\beta\) and the \(\mathbf a^\top\mathbf x\) rule gives \(2X^\top\mathbf y\):</p>
<div class="eq">\[\nabla J = \tfrac{1}{2m}\left(2X^\top X\beta - 2X^\top\mathbf y\right) = \tfrac1m X^\top(X\beta - \mathbf y)\]</div>
<p>Exactly the gradient we derived term by term. Two routes, one answer.</p>
`}
  ],
  examples: [
    { title: 'Compute the cost of a line', html: String.raw`
<p>Data: \((1,2),(2,4),(3,5)\). Candidate line \(\hat y = 0 + 1.5x\). Find \(J\).</p>
<table class="tbl compact"><thead><tr><th>\(x\)</th><th>\(y\)</th><th>\(\hat y\)</th><th>\(\hat y - y\)</th><th>\((\hat y-y)^2\)</th></tr></thead>
<tbody><tr><td>1</td><td>2</td><td>1.5</td><td>−0.5</td><td>0.25</td></tr><tr><td>2</td><td>4</td><td>3.0</td><td>−1.0</td><td>1.00</td></tr><tr><td>3</td><td>5</td><td>4.5</td><td>−0.5</td><td>0.25</td></tr></tbody></table>
<p>Sum of squares = 1.5, \(m=3\): \(J = \frac{1.5}{2\cdot 3} = \mathbf{0.25}\).</p>`},
    { title: 'One full gradient descent step', html: String.raw`
<p>Same data, start at \(\beta_0=\beta_1=0\), learning rate \(\alpha=0.1\).</p>
<ol class="steps plain">
<li>Predictions are all 0, errors \(\hat y - y = -2, -4, -5\). Starting cost \(J = \frac{4+16+25}{6} = 7.5\).</li>
<li>\(\frac{\partial J}{\partial\beta_0} = \frac13(-2-4-5)\cdot 1 = -3.667\) (remember \(x_0 = 1\)).</li>
<li>\(\frac{\partial J}{\partial\beta_1} = \frac13\big((-2)(1)+(-4)(2)+(-5)(3)\big) = \frac{-25}{3} = -8.333\).</li>
<li>Update both simultaneously: \(\beta_0 = 0 - 0.1(-3.667) = 0.367\), \(\beta_1 = 0 - 0.1(-8.333) = 0.833\).</li>
<li>New predictions 1.20, 2.03, 2.87; new cost \(J \approx 1.51\). One step cut the cost from 7.5 to 1.51.</li>
</ol>
<div class="note trap"><b>Trap</b>Do not update \(\beta_0\) and then use the <em>new</em> \(\beta_0\) to compute \(\beta_1\)'s gradient. Compute all gradients first, then update all coefficients.</div>`},
    { title: 'Learning rate: converge or diverge', html: String.raw`
<p>Minimise \(f(x)=(x-2)^2\) from \(x_0 = 5\). The update is \(x \leftarrow x - \alpha\cdot2(x-2)\), so the distance to the minimum is multiplied by \((1-2\alpha)\) every step.</p>
<table class="tbl compact"><thead><tr><th>\(\alpha\)</th><th>\(x_1\)</th><th>\(x_2\)</th><th>\(x_3\)</th><th>Behaviour</th></tr></thead>
<tbody>
<tr><td>0.1</td><td>4.40</td><td>3.92</td><td>3.54</td><td>Factor 0.8: smooth convergence</td></tr>
<tr><td>0.5</td><td>2.00</td><td>2.00</td><td>2.00</td><td>Factor 0: lands in one step</td></tr>
<tr><td>0.9</td><td>−0.40</td><td>3.92</td><td>0.46</td><td>Factor −0.8: bounces but converges</td></tr>
<tr><td>1.1</td><td>−1.60</td><td>6.32</td><td>−3.18</td><td>Factor −1.2: diverges</td></tr>
</tbody></table>
<p>For this function gradient descent converges exactly when \(0 \lt \alpha \lt 1\).</p>`},
    { title: 'Dot product and angle', html: String.raw`
<p>\(\mathbf u=(3,4)\), \(\mathbf v=(4,3)\). \(\mathbf u\cdot\mathbf v = 12+12 = 24\). \(\|\mathbf u\|=\|\mathbf v\|=5\). \(\cos\theta = \frac{24}{25} = 0.96\), so \(\theta\approx16.3°\): nearly aligned. With \(\mathbf w=(-4,3)\): \(\mathbf u\cdot\mathbf w = -12+12 = 0\), so \(\mathbf u \perp \mathbf w\).</p>`},
    { title: 'Inverse of a 2×2 matrix', html: String.raw`
<p>\(A=\begin{bmatrix}4&7\\2&6\end{bmatrix}\). \(\det A = 4\cdot6-7\cdot2 = 10\). \(A^{-1} = \frac1{10}\begin{bmatrix}6&-7\\-2&4\end{bmatrix} = \begin{bmatrix}0.6&-0.7\\-0.2&0.4\end{bmatrix}\). Check the top-left of \(AA^{-1}\): \(4(0.6)+7(-0.2) = 1\). ✓</p>`},
    { title: 'Shape-check the gradient', html: String.raw`
<p>\(m=5\) houses, \(n=3\) features. \(X\) is \(5\times4\) (with the ones column), \(\beta\) is \(4\times1\), \(X\beta\) and \(\mathbf y\) are \(5\times1\). \(X^\top\) is \(4\times5\), so \(X^\top(X\beta-\mathbf y)\) is \(4\times1\): one partial derivative per coefficient. If your shapes don't line up, your formula is wrong.</p>`}
  ],
  summary: {
    big: 'Machine learning finds model parameters from data instead of hand-written rules. Every algorithm is three choices: a representation (model form), an evaluation (cost function) and an optimization (usually gradient descent). For linear regression the cost is a convex bowl, the gradient is (1/m)Xᵀ(Xβ − y), and gradient descent steps against it with learning rate α.',
    concepts: [
      'ML = statistical algorithms that improve automatically with data; learning means encoding structure into parameters.',
      'Mitchell: learn from Experience E, for Task T, measured by Performance P.',
      'Supervised (labeled; classification or regression), unsupervised (unlabeled; clustering, anomaly detection), reinforcement (agent, rewards, trial and error).',
      'Features X are the inputs; the label y is the output to predict; target = f(features).',
      'Three pillars: representation, evaluation, optimization.',
      'Linear model ŷ = βᵀx with x₀ = 1; for all data ŷ = Xβ.',
      'Cost J(β) = (1/2m)Σ(ŷ − y)²: square removes sign and punishes big errors, 1/m averages, ½ cancels the derivative\'s 2.',
      'Gradient ∂J/∂βₖ = (1/m)Σ(ŷ − y)xₖ; matrix form ∇J = (1/m)Xᵀ(Xβ − y).',
      'Gradient descent: β ← β − α∇J, all coefficients updated simultaneously, repeat until a stopping rule.',
      'Learning rate too small = slow, too large = overshoot or diverge.',
      'Closed form (XᵀX)⁻¹Xᵀy exists only for simple models and costs O(n³); GD is the general tool.',
      'Dot product measures alignment: uᵀv = ‖u‖‖v‖cosθ; orthogonal vectors give 0.'
    ],
    terms: [
      ['Machine learning', 'Algorithms that improve automatically through data by inferring the best approach from the data itself.'],
      ['Supervised learning', 'Learning from labeled data to predict a label (classification) or a number (regression).'],
      ['Unsupervised learning', 'Finding structure (clusters, anomalies) in unlabeled data.'],
      ['Reinforcement learning', 'An agent learns actions by trial and error to maximise long-term reward.'],
      ['Feature', 'A known input characteristic used to predict the label (column of X).'],
      ['Label / target', 'The value we want to predict (y).'],
      ['Classification', 'Supervised task predicting a discrete category.'],
      ['Regression', 'Supervised task predicting a continuous value.'],
      ['Representation', 'The model/hypothesis form, e.g. ŷ = βᵀx.'],
      ['Cost (loss) function', 'A function that measures how wrong the model\'s predictions are; we minimise it.'],
      ['Residual', 'The error of one prediction, ŷ − y.'],
      ['Gradient', 'Vector of partial derivatives of J; points in the direction of steepest ascent.'],
      ['Gradient descent', 'Iterative optimizer: β ← β − α∇J until a stopping criterion is met.'],
      ['Learning rate α', 'Step-size hyperparameter of gradient descent.'],
      ['Convex function', 'Bowl-shaped; any local minimum is the global minimum.'],
      ['Design matrix', 'm × (n+1) matrix of all examples with a leading column of ones.'],
      ['Dot product', 'Σ uᵢvᵢ = ‖u‖‖v‖cosθ; a scalar measuring alignment.'],
      ['Norm', 'Length of a vector, ‖v‖ = √(Σ vᵢ²).'],
      ['Matrix inverse', 'A⁻¹ with AA⁻¹ = I; exists only if A is square and det(A) ≠ 0.']
    ],
    formulas: [
      ['Linear model', String.raw`\hat y=\sum_{i=0}^{n}\beta_i x_i=\beta^\top x,\quad \hat{\mathbf y}=X\beta`],
      ['Cost (MSE)', String.raw`J(\beta)=\frac{1}{2m}\sum_{j=1}^{m}\left(\hat y^{(j)}-y^{(j)}\right)^2`],
      ['Partial derivative', String.raw`\frac{\partial J}{\partial\beta_k}=\frac1m\sum_{j=1}^{m}\left(\hat y^{(j)}-y^{(j)}\right)x_k^{(j)}`],
      ['Gradient (matrix)', String.raw`\nabla_\beta J=\frac1m X^\top(X\beta-\mathbf y)`],
      ['Update rule', String.raw`\beta\leftarrow\beta-\alpha\nabla_\beta J`],
      ['Normal equation', String.raw`\beta=(X^\top X)^{-1}X^\top\mathbf y`],
      ['Dot product', String.raw`\mathbf u\cdot\mathbf v=\sum_i u_iv_i=\|\mathbf u\|\|\mathbf v\|\cos\theta`],
      ['2×2 inverse', String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix}^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}`],
      ['Vector derivatives', String.raw`\tfrac{\partial}{\partial\mathbf x}\mathbf a^\top\mathbf x=\mathbf a,\quad \tfrac{\partial}{\partial\mathbf x}\mathbf x^\top A\mathbf x=(A+A^\top)\mathbf x`]
    ],
    traps: [
      'Anomaly detection without fraud labels is unsupervised, even though "fraud" sounds like a label.',
      'Gradient descent subtracts the gradient. Adding it climbs uphill.',
      'Update all coefficients simultaneously, using gradients computed from the old β.',
      'A larger learning rate is not always faster; past a threshold it diverges.',
      'Matrix multiplication needs matching inner dimensions and is not commutative.',
      'Only square matrices with non-zero determinant are invertible.'
    ],
    recall: [
      ['Name the three pillars and give them for linear regression.', 'Representation ŷ = βᵀx; evaluation J = (1/2m)Σ(ŷ−y)²; optimization gradient descent.'],
      ['Why is the cost squared and multiplied by 1/2m?', 'Squaring removes sign, punishes large errors and is differentiable; 1/m averages over examples; ½ cancels the 2 from differentiation.'],
      ['Write the gradient of J in matrix form and give its shape.', '(1/m)Xᵀ(Xβ − y); shape (n+1) × 1, one entry per coefficient.'],
      ['Give two reasons we prefer gradient descent over the normal equation.', 'Inversion is O(n³) and fails if XᵀX is singular; most models (logistic, SVM, NN) have no closed form.'],
      ['What happens with a learning rate that is too large?', 'Steps overshoot the minimum, bounce and can diverge with growing cost.'],
      ['When is the dot product of two vectors 0?', 'When they are orthogonal (θ = 90°).'],
      ['Classify: AlphaGo self-play; labelled selfies; Netflix taste tribes.', 'Reinforcement; supervised (classification); unsupervised (clustering).']
    ]
  },
  quiz: [
    { q: 'A bank flags a bizarre transaction with no examples of fraud to learn from. Which type of learning is this?', o: ['Supervised classification', 'Unsupervised anomaly detection', 'Reinforcement learning', 'Supervised regression'], a: 1, e: 'There are no fraud labels, so the model can only spot points that look unusual: unsupervised anomaly detection.' },
    { q: 'Predicting tomorrow\'s temperature from ten years of weather logs is…', o: ['Supervised regression', 'Supervised classification', 'Unsupervised clustering', 'Reinforcement learning'], a: 0, e: 'The past logs contain the answers (labels) and the target is a continuous number.' },
    { q: String.raw`Why does the cost \(J(\beta)=\frac{1}{2m}\sum(\hat y-y)^2\) include the factor \(\frac12\)?`, o: ['To make J convex', 'To cancel the 2 produced when differentiating the square', 'To average over examples', 'To keep J below 1'], a: 1, e: 'The ½ is a convenience: d/dβ of (·)² brings down a 2 that cancels it. The 1/m does the averaging.' },
    { q: String.raw`Which expression is the gradient of the MSE cost in matrix form?`, o: [String.raw`\(\frac1m X(X\beta-\mathbf y)\)`, String.raw`\(\frac1m X^\top(X\beta-\mathbf y)\)`, String.raw`\(\frac1m (X\beta-\mathbf y)X^\top\)`, String.raw`\(\frac1m X^\top X\beta\)`], a: 1, e: String.raw`Shapes: \(X^\top\) is \((n+1)\times m\), the error vector is \(m\times1\), so the product is one slope per coefficient.` },
    { q: 'In gradient descent, why do we move in the direction of the negative gradient?', o: ['The gradient points to steepest ascent, so its negative points downhill', 'The gradient is always negative', 'It makes the learning rate smaller', 'It guarantees one-step convergence'], a: 0, e: 'The gradient is the direction of fastest increase of J; subtracting it decreases J fastest.' },
    { q: 'The cost increases every iteration and the parameters blow up. The most likely cause is…', o: ['Learning rate too small', 'Learning rate too large', 'Too few features', 'The cost is convex'], a: 1, e: 'A too-large α overshoots the minimum on each step, so the error grows: divergence.' },
    { q: 'Why can\'t we use an exact formula for most models in this course?', o: ['Formulas are always less accurate', 'Models like logistic regression and neural networks have no closed-form solution', 'Gradient descent is exact', 'Formulas need labeled data'], a: 1, e: 'Setting their gradient to zero has no algebraic solution, so we search numerically.' },
    { q: 'Multiplying a (3 × 2) matrix by a (2 × 4) matrix gives…', o: ['(2 × 2)', '(3 × 4)', '(4 × 3)', 'undefined'], a: 1, e: '(n × m)(m × k) = (n × k): inner 2s match, outer 3 and 4 remain.' },
    { q: String.raw`Two unit vectors have dot product \(-1\). They are…`, o: ['Orthogonal', 'Perfectly aligned', 'Pointing in opposite directions', 'Of different lengths'], a: 2, e: String.raw`\(\cos\theta=-1\) means \(\theta=180°\).` },
    { q: 'Which is NOT one of the three pillars of an ML algorithm?', o: ['Representation', 'Evaluation', 'Regularization', 'Optimization'], a: 2, e: 'Regularization (Lecture 2) is a modification of the evaluation pillar, not a pillar itself.' },
    { q: String.raw`Which matrix has no inverse? \(\begin{bmatrix}2&4\\1&2\end{bmatrix}\) has determinant…`, o: ['8, so it is invertible', '0, so it is not invertible', '4, so it is invertible', '−8, so it is invertible'], a: 1, e: '2·2 − 4·1 = 0. A zero determinant means no inverse.' }
  ]
});

/* ------------------------------------------------------------------ L2 */
LECTURES.push({
  id: 'l2', code: 'L2', short: 'Bias-Variance & Regularization', title: 'Polynomial Regression & Regularization',
  thesis: 'Bend a straight line into a curve, discover that too much bending memorises noise, then learn to push back with a penalty.',
  learn: [
    { id: 'family', title: 'From lines to curves', html: String.raw`
<ul>
<li><b>Simple linear regression</b>: one feature, a straight-line relationship.</li>
<li><b>Multiple linear regression</b>: several features, still linear in each.</li>
<li><b>Polynomial regression</b>: models a <em>non-linear</em> relationship between the features \(x\) and the response \(y\).</li>
</ul>
<p>A straight line is often too rigid. A car's braking distance grows with the <em>square</em> of its speed: double the speed and the stopping distance roughly quadruples. App response time creeps up with users, then spikes. Force a line through curved data and it <b>underfits</b>: high bias, poor predictions.</p>
`},
    { id: 'trick', title: 'The trick: raise x to powers, then add', html: String.raw`
<p>Keep linear regression exactly as it is. Just feed it <b>new features</b> that are powers of \(x\). A polynomial model of degree \(M\):</p>
<div class="eq">\[\hat y = \beta_0 + \beta_1 x + \beta_2 x^2 + \dots + \beta_M x^M = \sum_{k=0}^{M}\beta_k x^k\]</div>
<p>Each power has its own shape: \(x\) is a line, \(x^2\) a U-shaped bowl, \(x^3\) an S-curve. Linear regression picks a weight for each shape, and adding the weighted shapes builds the final curve.</p>
<div class="note trap"><b>"Linear" has two meanings</b>The curve is <em>not</em> linear in \(x\); it bends. But the model is <b>linear in the parameters</b> \(\beta\). Once \(x, x^2, \dots\) are computed they are just columns of \(X\), and the prediction is a weighted sum \(X\beta\). That is why Lecture 1's cost function and gradient descent work unchanged.</div>
<h4>Why powers can help</h4>
<p>Suppose a feature relates to the label like \(\log(x)\): steep at first, then flattening. A single \(\beta x\) cannot follow it. Adding \(x^2\), \(x^3\) gives the model extra shapes to combine, and the relationship becomes much easier to approximate with linear coefficients. Not every feature hides a higher-order signal, so treat powers as candidates, not guarantees.</p>
`},
    { id: 'interact', title: 'Interaction terms: when features work together', html: String.raw`
<p>Polynomial features solve a second problem: <b>synergy</b>. Newspaper ads alone might do little, but people who see a TV ad and are later "reminded" by a newspaper ad may buy far more than either ad produces alone. The effect of one feature depends on the value of another.</p>
<p>The simplest fix: add a feature that multiplies them, the <b>interaction term</b> \(x_1 x_2\). Keep \(x_1\) and \(x_2\), add \(x_1x_2\), and the model can learn how much they amplify each other.</p>
<p>Scikit-learn's <code>PolynomialFeatures</code> (in <code>sklearn.preprocessing</code>) generates, for a chosen degree:</p>
<ul>
<li>the <b>bias</b> column (all 1.0, the intercept),</li>
<li>each feature <b>raised to every power</b> up to the degree,</li>
<li>all <b>interaction</b> products between features.</li>
</ul>
<p>Two features \(A, B\), degree 2 → \([1,\; A,\; B,\; A^2,\; AB,\; B^2]\). For the row \(A=2, B=3\): \([1, 2, 3, 4, 6, 9]\).</p>
<div class="viz" data-viz="polyFeat"></div>
<div class="note intuition"><b>The cost of power</b>We now have more features than the original dataset, and a coefficient to estimate for each. There is no guarantee that higher-order or interaction terms carry real signal. More columns also means more freedom to fit noise, which leads straight to the next topic.</div>
`},
    { id: 'biasvar', title: 'Bias and variance', html: String.raw`
<p>How do we choose the polynomial degree? Increasing model complexity always buys a better fit to the training data, but it trades off two kinds of error. This trade-off applies to <b>every</b> supervised model, not just polynomials.</p>
<ul>
<li><b>Bias</b>: the model is <em>systematically</em> off because it is too simple to express the real pattern. This is <b>underfitting</b>.</li>
<li><b>Variance</b>: the model is too <em>sensitive</em>. Nudge the training data and its predictions swing wildly. This is <b>overfitting</b>.</li>
</ul>
<p>On a dartboard: bias is how far your average throw lands from the bullseye; variance is how scattered your throws are. We want throws that are tight <em>and</em> centred.</p>
<div class="viz" data-viz="darts"></div>
<h4>The decomposition</h4>
<p>Imagine drawing many different training sets from the same source, fitting the model to each, and predicting the same new point \(x_0\). For squared error the expected test error splits exactly into three pieces (ISLR Ch. 2):</p>
<div class="eq">\[\mathbb E\big[(y_0-\hat f(x_0))^2\big] = \underbrace{\big(\mathbb E[\hat f(x_0)]-f(x_0)\big)^2}_{\text{Bias}^2} + \underbrace{\mathbb E\big[(\hat f(x_0)-\mathbb E[\hat f(x_0)])^2\big]}_{\text{Variance}} + \underbrace{\sigma^2}_{\text{irreducible}}\]</div>
<ul>
<li><b>Bias²</b>: how far the <em>average</em> fitted model is from the truth.</li>
<li><b>Variance</b>: how much individual fits scatter around their own average.</li>
<li><b>Irreducible error \(\sigma^2\)</b>: noise in the data itself. No model can beat it.</li>
</ul>
<p>Bias² and variance are the <b>reducible</b> error. As complexity grows, bias falls but variance rises, so the total error is <b>U-shaped</b> and the best model sits at the bottom. The simulation below does exactly what the formula describes: it draws 30 training sets, fits each one, and measures the spread.</p>
<div class="viz" data-viz="bvSim"></div>
`},
    { id: 'fitting', title: 'Overfitting and underfitting in practice', html: String.raw`
<table class="tbl">
<thead><tr><th></th><th>Underfitting</th><th>Good fit</th><th>Overfitting</th></tr></thead>
<tbody>
<tr><th>Model</th><td>Too simple</td><td>Right complexity</td><td>Too complex</td></tr>
<tr><th>Bias / variance</td><td>High bias, low variance</td><td>Balanced</td><td>Low bias, high variance</td></tr>
<tr><th>Training error</th><td>High</td><td>Low</td><td>Very low (can be 0)</td></tr>
<tr><th>Test error</th><td>High</td><td>Low</td><td>High</td></tr>
<tr><th>What it does</th><td>Misses the trend</td><td>Captures the trend</td><td>Memorises the noise</td></tr>
</tbody></table>
<p>Overfitting is the sneaky one. The training error looks perfect, so you think the model is excellent, but it only performs well on data it has already seen. A polynomial that passes through every training point has zero training error and wild swings between points.</p>
<p>With many features we cannot <em>see</em> the curve, so we plot <b>error against model complexity</b> for both sets. Move the degree slider and watch the two curves on the right.</p>
<div class="viz" data-viz="polyLab"></div>
<ul>
<li><b>Training error</b> keeps falling as complexity rises, because the model captures more and more of the noise.</li>
<li><b>Test error</b> falls, bottoms out, then rises. The point where it starts rising is where overfitting begins.</li>
<li>Pick the complexity at the bottom of the test (validation) curve. For polynomials, complexity is the degree; other algorithms have their own complexity hyperparameters (tree depth, number of neighbours…).</li>
</ul>
<div class="note exam"><b>Exam tip</b>Diagnose from two numbers. High train + high test error: underfitting. Low train + high test error: overfitting. Low and similar: good. The gap between train and test error is the signature of variance.</div>
`},
    { id: 'reg', title: 'Regularization: the big-coefficient problem', html: String.raw`
<p>Overfit models usually have <b>huge coefficients</b>: big positive and negative weights fighting each other to snake the curve through every point. Huge weights mean high variance, because a small change in \(x\) gets multiplied by a big \(\beta\) and swings the prediction.</p>
<p>The fix: while fitting, also keep the coefficients small. We add a <b>penalty on coefficient size</b> to the cost, so the model must fit the data <em>and</em> keep \(\beta\) small:</p>
<div class="eq">\[\text{minimise}\quad \text{RSS}(\beta) + \lambda\cdot\text{Penalty}(\beta),\qquad \text{RSS}=\sum_{i=1}^{m}\Big(y_i-\beta_0-\sum_{j=1}^{p}\beta_j x_{ij}\Big)^2\]</div>
<ul>
<li>Regularization <b>minimises model complexity</b>, <b>penalises the loss function</b>, and <b>reduces overfitting</b>.</li>
<li>It deliberately <b>adds a little bias</b> to buy a big drop in variance: the bias-variance trade-off in action.</li>
<li>\(\lambda \ge 0\) is the dial. \(\lambda=0\) is ordinary least squares; larger \(\lambda\) forces smaller coefficients.</li>
<li>Cost: a new <b>hyperparameter</b> to tune, by guess-and-check with cross-validation.</li>
</ul>
<p>Three flavours: <b>L2 / Ridge</b>, <b>L1 / Lasso</b>, and their combination <b>Elastic Net</b>.</p>
<p>Go back to the lab above, set the degree to 12, and raise \(\log_{10}\lambda\). The wiggles flatten, the coefficient bars shrink, and the test error drops.</p>
`},
    { id: 'ridge', title: 'Ridge regression (L2)', html: String.raw`
<div class="eq">\[\text{Ridge:}\quad \text{RSS} + \lambda\sum_{j=1}^{p}\beta_j^2\]</div>
<p>The penalty is the <b>sum of squared coefficients</b> (the squared L2 norm), called the <b>shrinkage penalty</b>. The intercept \(\beta_0\) is not penalised; we only want to shrink slopes.</p>
<h4>The thought experiment from class</h4>
<p>With only a few training points, least squares can draw a line that passes through all of them: RSS = 0. On new test points the residuals are large, so the line has high variance. Ridge accepts a slightly <em>worse</em> training fit with a <em>smaller slope</em>. In one dimension a larger \(\beta\) means a steeper line, so a feature change produces a bigger \(y\) response. Shrinking the slope makes predictions less sensitive to the exact training points, and the model performs consistently on training and test data.</p>
<p>See the worked example "Ridge prefers the flatter line" for numbers.</p>
<div class="note beyond"><b>Beyond the slides</b>The gradient of the penalty is \(2\lambda\beta_j\). Each gradient step therefore shrinks every weight by a fixed fraction, which is why L2 is called <b>weight decay</b> in neural networks. Ridge also has a closed form, \(\beta=(X^\top X+\lambda I)^{-1}X^\top\mathbf y\), and adding \(\lambda I\) makes the matrix always invertible.</div>
<h4>Choosing λ by cross-validation</h4>
<p>You cannot read the best \(\lambda\) off the training error: a bigger \(\lambda\) <em>always</em> looks worse on training data. Instead, try a grid of \(\lambda\) values, estimate test error for each with <b>k-fold cross-validation</b>, and keep the one with the lowest CV error. In scikit-learn: <code>RidgeCV</code> / <code>LassoCV</code>.</p>
<div class="note trap"><b>Scikit-learn naming</b>Scikit-learn calls \(\lambda\) <code>alpha</code>. It also reports errors as <b>negative</b> RMSE (<code>neg_root_mean_squared_error</code>) so that for every scorer "higher is better", the same as accuracy.</div>
`},
    { id: 'lasso', title: 'Lasso regression (L1)', html: String.raw`
<div class="eq">\[\text{Lasso:}\quad \text{RSS} + \lambda\sum_{j=1}^{p}|\beta_j|\]</div>
<p>The penalty is the sum of <b>absolute values</b>. It also limits coefficient size, but with a crucial difference: when \(\lambda\) is large enough, Lasso forces some coefficients to be <b>exactly zero</b>.</p>
<ul>
<li>A zero coefficient drops that feature from the model, so Lasso performs <b>feature (variable) selection</b>, like subset selection.</li>
<li>The result is a <b>sparse</b> model that is much easier to interpret.</li>
<li><code>LassoCV</code> searches a range of alphas automatically (you give the number of alphas, not the values).</li>
</ul>
<h4>Why Lasso zeros coefficients</h4>
<p>Rewrite both as <em>constrained</em> problems: minimise RSS subject to a budget on coefficient size. Ridge's budget is a <b>circle</b> \(\beta_1^2+\beta_2^2\le t\); Lasso's is a <b>diamond</b> \(|\beta_1|+|\beta_2|\le t\). The solution is where the RSS contour ellipses first touch the budget region. The diamond has sharp <b>corners on the axes</b>, where one coefficient is exactly 0, and expanding ellipses very often hit a corner first. The circle has no corners, so Ridge only shrinks.</p>
<div class="viz" data-viz="geometry"></div>
`},
    { id: 'enet', title: 'Ridge vs Lasso vs Elastic Net', html: String.raw`
<table class="tbl">
<thead><tr><th></th><th>Ridge (L2)</th><th>Lasso (L1)</th><th>Elastic Net</th></tr></thead>
<tbody>
<tr><th>Penalty</th><td>\(\lambda\sum\beta_j^2\)</td><td>\(\lambda\sum|\beta_j|\)</td><td>\(\lambda_1\sum|\beta_j|+\lambda_2\sum\beta_j^2\)</td></tr>
<tr><th>Effect</th><td>Shrinks all, removes none</td><td>Shrinks and sets some to 0</td><td>Both</td></tr>
<tr><th>Best when</th><td>Most variables are useful</td><td>Many variables are useless</td><td>Unknown, or correlated features</td></tr>
<tr><th>Correlated features</th><td>Shrinks them together</td><td>Keeps one, drops the rest</td><td>Groups them: keeps or drops together</td></tr>
</tbody></table>
<p>When you know your variables well, choosing is easy. With millions of parameters you almost certainly need some regularization, and you don't know in advance which variables are useful. <b>Elastic Net</b> combines both penalties and tunes the mix with cross-validation. It is especially good with correlated features, where Lasso alone arbitrarily picks one.</p>
<p>Instead of two \(\lambda\)s, Elastic Net is usually written with one strength \(\lambda\) and a mixing parameter \(\alpha\in[0,1]\):</p>
<div class="eq">\[\text{RSS} + \lambda\Big(\alpha\sum_j|\beta_j| + (1-\alpha)\sum_j\beta_j^2\Big)\]</div>
<p>\(\alpha = 0\) gives pure Ridge, \(\alpha = 1\) gives pure Lasso. (Scikit-learn calls this mixing parameter <code>l1_ratio</code> and the strength <code>alpha</code>; some texts put a ½ on the squared term.)</p>
<p>The paths below show every coefficient as \(\lambda\) grows. Slide the mix from Ridge to Lasso and watch smooth shrinking turn into coefficients snapping to zero one after another.</p>
<div class="viz" data-viz="paths"></div>
`},
    { id: 'beyond', title: 'Regularization beyond linear models', html: String.raw`
<p>"Add something that discourages complexity" powers modern ML:</p>
<ul>
<li><b>Weight decay</b>: the L2 penalty applied to neural network weights.</li>
<li><b>Dropout</b>: randomly switches off neurons during training, another way to cut variance.</li>
<li><b>Early stopping</b> and <b>data augmentation</b> are regularization in spirit.</li>
<li>For trees (Lecture 4): depth limits and pruning play the same role.</li>
</ul>
<p>Takeaway: whenever a model is flexible enough to overfit, some form of regularization is how we push back.</p>
`}
  ],
  examples: [
    { title: 'Generate polynomial features by hand', html: String.raw`
<p><b>(a)</b> Features \(X_1=2, X_2=3\), degree 2: \([1, X_1, X_2, X_1^2, X_1X_2, X_2^2] = [1,2,3,4,6,9]\).</p>
<p><b>(b)</b> One feature \(x=2\), degree 3: \([1, 2, 4, 8]\).</p>
<p><b>(c)</b> Two features \(a,b\), degree 3: \(1, a, b, a^2, ab, b^2, a^3, a^2b, ab^2, b^3\), 10 columns. In general \(n\) features at degree \(d\) give \(\binom{n+d}{d}\) columns, which grows fast.</p>`},
    { title: 'Diagnose the fit', html: String.raw`
<table class="tbl compact"><thead><tr><th>Train RMSE</th><th>Test RMSE</th><th>Diagnosis</th><th>Action</th></tr></thead><tbody>
<tr><td>9.8</td><td>10.1</td><td>Underfitting (high bias)</td><td>More complexity: higher degree, more features, smaller λ</td></tr>
<tr><td>0.4</td><td>12.7</td><td>Overfitting (high variance)</td><td>Less complexity, larger λ, more data</td></tr>
<tr><td>2.1</td><td>2.4</td><td>Good fit</td><td>Keep it; report test error</td></tr>
</tbody></table>`},
    { title: 'Ridge prefers the flatter line', html: String.raw`
<p>Training points \((1,1)\) and \((2,3)\). Compare two lines with \(\lambda=1\).</p>
<table class="tbl compact"><thead><tr><th>Line</th><th>Residuals</th><th>RSS</th><th>Ridge penalty \(\lambda\beta_1^2\)</th><th>Ridge cost</th><th>Lasso cost \(\text{RSS}+\lambda|\beta_1|\)</th></tr></thead><tbody>
<tr><td>\(\hat y=-1+2x\) (exact fit)</td><td>0, 0</td><td>0</td><td>4</td><td><b>4</b></td><td>2</td></tr>
<tr><td>\(\hat y=-0.25+1.5x\)</td><td>0.25, −0.25</td><td>0.125</td><td>2.25</td><td><b>2.375</b></td><td>1.625</td></tr>
</tbody></table>
<p>Plain least squares picks the exact fit (RSS 0). Ridge and Lasso both prefer the flatter line: it gives up a little training accuracy (bias) for a smaller slope (lower variance).</p>`},
    { title: 'Why Lasso hits exactly zero (1-D)', html: String.raw`
<p>Minimise \(\tfrac12(\beta-b)^2 + \text{penalty}\), where \(b\) is the unpenalised estimate.</p>
<ul>
<li>Ridge, penalty \(\tfrac{\lambda}{2}\beta^2\): derivative \((\beta-b)+\lambda\beta=0\Rightarrow \beta=\frac{b}{1+\lambda}\). Shrinks by a <em>fraction</em>; never exactly 0 unless \(b=0\).</li>
<li>Lasso, penalty \(\lambda|\beta|\): solution \(\beta=\text{sign}(b)\max(|b|-\lambda,0)\) ("soft thresholding"). Subtracts a fixed amount and clips at 0.</li>
</ul>
<p>With \(b=0.8,\lambda=1\): Ridge gives 0.4, Lasso gives <b>0</b>. The L1 penalty's slope stays \(\pm\lambda\) right up to zero, so it can push all the way; L2's slope \(\lambda\beta\) fades as \(\beta\) shrinks.</p>`},
    { title: 'Picking λ with 5-fold CV', html: String.raw`
<table class="tbl compact"><thead><tr><th>λ</th><th>0.001</th><th>0.01</th><th>0.1</th><th>1</th><th>10</th></tr></thead><tbody>
<tr><td>Mean CV RMSE</td><td>4.8</td><td>3.9</td><td><b>3.1</b></td><td>3.6</td><td>6.2</td></tr></tbody></table>
<p>Small λ: overfitting (variance). Large λ: underfitting (bias). Choose λ = 0.1, refit on all training data, and report the error on the untouched test set.</p>`}
  ],
  summary: {
    big: 'Polynomial regression adds powers and interaction terms as new features; the model stays linear in β so least squares and gradient descent still apply. More complexity lowers bias but raises variance, giving a U-shaped test error. Regularization adds a penalty λ·(size of β) to RSS: Ridge (L2) shrinks all coefficients, Lasso (L1) sets some to exactly zero, Elastic Net mixes both. λ is tuned with cross-validation.',
    concepts: [
      'Polynomial model ŷ = Σ βₖxᵏ: non-linear in x, linear in β.',
      'PolynomialFeatures creates bias, powers and interaction terms (e.g. [1, A, B, A², AB, B²]).',
      'Interaction term x₁x₂ captures synergy: the effect of one feature depends on another.',
      'Bias = systematic error from a too-simple model (underfitting); variance = sensitivity to the training sample (overfitting).',
      'Expected test error = Bias² + Variance + σ² (irreducible noise).',
      'Training error always falls with complexity; test error is U-shaped. Choose complexity at the test/validation minimum.',
      'Overfit models have huge coefficients; regularization penalises their size.',
      'Ridge: RSS + λΣβ² shrinks but never removes. Lasso: RSS + λΣ|β| is sparse and selects features.',
      'Geometry: circle (L2) vs diamond (L1) budget; the diamond\'s corners lie on the axes.',
      'Elastic Net mixes L1 and L2 (α = 0 Ridge, α = 1 Lasso); good for correlated features.',
      'λ = 0 is OLS; larger λ adds bias and removes variance; pick λ by k-fold CV (sklearn calls it alpha).'
    ],
    terms: [
      ['Polynomial regression', 'Linear regression on powers of the features; fits curves while staying linear in β.'],
      ['Interaction term', 'Product of features (x₁x₂) modelling a synergy effect.'],
      ['PolynomialFeatures', 'sklearn transformer producing bias, power and interaction columns.'],
      ['Bias', 'Error from overly simple assumptions; the average fit misses the truth.'],
      ['Variance', 'How much the fitted model changes across different training sets.'],
      ['Irreducible error', 'Noise σ² in the data; no model can remove it.'],
      ['Underfitting', 'Too simple; high bias; poor on train and test.'],
      ['Overfitting', 'Too complex; high variance; great on train, poor on test.'],
      ['Model complexity', 'Flexibility of a model, e.g. polynomial degree or tree depth.'],
      ['Regularization', 'Adding a penalty on model complexity to the loss to reduce overfitting.'],
      ['Shrinkage penalty', 'The λ-weighted term added to RSS that pulls coefficients toward 0.'],
      ['Ridge (L2)', 'RSS + λΣβⱼ²; shrinks all coefficients smoothly.'],
      ['Lasso (L1)', 'RSS + λΣ|βⱼ|; can set coefficients exactly to 0 (feature selection).'],
      ['Elastic Net', 'Combines L1 and L2 penalties with a mixing parameter.'],
      ['λ (alpha in sklearn)', 'Regularization strength hyperparameter.'],
      ['Cross-validation', 'Estimating test error by rotating validation folds; used to tune λ or degree.'],
      ['Sparse model', 'Model in which many coefficients are exactly zero.'],
      ['Weight decay', 'The L2 penalty in neural networks.']
    ],
    formulas: [
      ['Polynomial model', String.raw`\hat y=\sum_{k=0}^{M}\beta_k x^k`],
      ['Bias-variance', String.raw`\mathbb E[(y_0-\hat f(x_0))^2]=\text{Bias}^2+\text{Var}+\sigma^2`],
      ['RSS', String.raw`\text{RSS}=\sum_{i=1}^{m}\Big(y_i-\beta_0-\sum_{j=1}^{p}\beta_jx_{ij}\Big)^2`],
      ['Ridge', String.raw`\text{RSS}+\lambda\sum_{j=1}^{p}\beta_j^2`],
      ['Lasso', String.raw`\text{RSS}+\lambda\sum_{j=1}^{p}|\beta_j|`],
      ['Elastic Net', String.raw`\text{RSS}+\lambda\Big(\alpha\sum_j|\beta_j|+(1-\alpha)\sum_j\beta_j^2\Big)`],
      ['Constraint view', String.raw`\min \text{RSS}\ \text{s.t.}\ \sum\beta_j^2\le t\ \ (\text{L2}),\ \ \sum|\beta_j|\le t\ \ (\text{L1})`]
    ],
    traps: [
      'Polynomial regression is still a linear model (linear in β).',
      'Zero training error is a warning sign, not a success.',
      'Never pick λ or the degree using training error, and never using the test set: use validation / CV.',
      'Ridge never sets coefficients exactly to zero; only Lasso (and Elastic Net) can.',
      'The intercept β₀ is not penalised.',
      'In sklearn, alpha means λ for Ridge/Lasso; the L1/L2 mix is l1_ratio.',
      'Regularization increases bias on purpose; it reduces variance.'
    ],
    recall: [
      ['Why can gradient descent still fit a degree-5 polynomial?', 'The model is linear in β; the powers are just extra feature columns.'],
      ['List PolynomialFeatures output for A, B at degree 2.', '1, A, B, A², AB, B².'],
      ['State the bias-variance decomposition.', 'Expected squared test error = Bias² + Variance + irreducible σ².'],
      ['What do train and test error look like as complexity grows?', 'Train error decreases steadily; test error decreases then increases (U-shape).'],
      ['Ridge vs Lasso penalty and effect?', 'Ridge λΣβ² shrinks all; Lasso λΣ|β| shrinks and sets some to exactly 0.'],
      ['Why does Lasso give exact zeros geometrically?', 'Its diamond constraint has corners on the axes; RSS ellipses tend to touch a corner first.'],
      ['When prefer Elastic Net?', 'When many features may be useless and some are correlated; it groups correlated features.'],
      ['How is λ chosen?', 'Grid of λ values, k-fold cross-validation, pick lowest CV error (RidgeCV / LassoCV).']
    ]
  },
  quiz: [
    { q: String.raw`The model \(\hat y=\beta_0+\beta_1x+\beta_2x^2\) is called linear regression because…`, o: ['It produces a straight line', 'It is linear in the parameters β', 'x² is a linear function', 'It cannot overfit'], a: 1, e: 'It bends in x but is a weighted sum of fixed columns, so it is linear in β.' },
    { q: 'PolynomialFeatures(degree=2) on the row X₁ = 2, X₂ = 3 outputs…', o: ['[2, 3, 4, 9]', '[1, 2, 3, 4, 6, 9]', '[1, 2, 3, 6]', '[1, 4, 9, 6]'], a: 1, e: 'Bias 1, originals 2 and 3, then X₁² = 4, X₁X₂ = 6, X₂² = 9.' },
    { q: 'A model has training RMSE 0.3 and test RMSE 14. It is most likely…', o: ['Underfitting / high bias', 'Overfitting / high variance', 'A good fit', 'Suffering from irreducible error'], a: 1, e: 'A huge gap between low training error and high test error is the signature of variance.' },
    { q: 'Which part of the expected test error can no model reduce?', o: ['Bias²', 'Variance', 'Irreducible error σ²', 'Training error'], a: 2, e: 'σ² is noise in the data itself.' },
    { q: 'As polynomial degree increases, what happens to the training error?', o: ['It always decreases (or stays the same)', 'It is U-shaped', 'It always increases', 'It is unaffected'], a: 0, e: 'A more flexible model can always fit the training data at least as well.' },
    { q: 'Which regularizer can set coefficients exactly to zero?', o: ['Ridge (L2)', 'Lasso (L1)', 'Neither', 'Only OLS'], a: 1, e: 'The L1 penalty (diamond constraint) creates sparse solutions.' },
    { q: 'Increasing λ in Ridge regression…', o: ['Decreases bias, increases variance', 'Increases bias, decreases variance', 'Leaves both unchanged', 'Increases both'], a: 1, e: 'Stronger shrinkage makes the model simpler: more bias, less variance.' },
    { q: 'Why can\'t we choose λ by minimising the training error?', o: ['Training error ignores λ', 'A larger λ always makes training error worse, so we\'d always pick λ = 0', 'Training error is negative', 'λ only affects the intercept'], a: 1, e: 'The penalty only ever trades training fit for simplicity; we need validation data to see the benefit.' },
    { q: 'Elastic Net with mixing parameter α = 0 is equivalent to…', o: ['Lasso', 'Ridge', 'OLS', 'Logistic regression'], a: 1, e: 'α weights the L1 part; α = 0 leaves only the L2 (Ridge) penalty.' },
    { q: 'Two features are highly correlated. Lasso tends to…', o: ['Keep both with equal weight', 'Keep one and drop the other', 'Drop both always', 'Double both'], a: 1, e: 'Lasso picks one of a correlated group; Elastic Net keeps or drops them together.' },
    { q: 'In scikit-learn, Ridge(alpha=…) sets…', o: ['The learning rate', 'The penalty strength λ', 'The L1/L2 ratio', 'The polynomial degree'], a: 1, e: 'sklearn uses alpha as the name for λ across models.' }
  ]
});

/* ------------------------------------------------------------------ L3A */
LECTURES.push({
  id: 'l3a', code: 'L3A', short: 'Logistic Regression', title: 'Logistic Regression',
  thesis: 'Bend a familiar linear score into a probability with the sigmoid, then choose the coefficients that make the observed labels most likely.',
  learn: [
    { id: 'cats', title: 'From numbers to categories', html: String.raw`
<p>So far we predicted continuous labels. Now we predict a <b>category</b>: spam or not, cat/dog/neither, positive or negative review, benign or malignant. (Every "select all images with a bus" puzzle is you hand-labelling training data for someone's classifier.)</p>
<p><b>Logistic regression is a classification algorithm</b>, despite the word "regression" in its name. It predicts a categorical label (two or more discrete classes) from historical feature data.</p>
<ul>
<li>Any continuous target can be turned into categories by <b>discretization</b>: house price $0-100k is class 0, $100-200k class 1, above $200k class 2.</li>
<li>Classifiers usually output a <b>probability per class</b> (car 10%, street 85%, bridge 5%) and report the most likely class ("street").</li>
<li>\(y-\hat y\) is meaningless for categories ("car minus street"?), so we need new error metrics: <b>accuracy, precision, recall, F1</b>.</li>
</ul>
<h4>Classification metrics in one picture</h4>
<p>For a binary problem, every prediction lands in one cell of the <b>confusion matrix</b>: true positive (TP), false positive (FP), false negative (FN), true negative (TN).</p>
<div class="eq">\[\text{Precision}=\frac{TP}{TP+FP}\qquad \text{Recall}=\frac{TP}{TP+FN}\qquad F_1=\frac{2\cdot P\cdot R}{P+R}\]</div>
<p><b>Precision</b>: of everything I flagged positive, how much was right? <b>Recall</b>: of all real positives, how many did I catch? <b>F1</b> is their harmonic mean. You will see these in action with the threshold lab at the end of this lecture.</p>
`},
    { id: 'whynot', title: 'Why not just use linear regression?', html: String.raw`
<p>Take the lecture's dataset: standardized income (0 = average, negatives below average) against whether the loan was paid (1) or defaulted (0).</p>
<table class="tbl compact"><thead><tr><th>Income</th><td>−5</td><td>−4</td><td>−2</td><td>−1</td><td>0</td><td>2</td><td>3</td><td>4</td><td>5</td></tr></thead>
<tbody><tr><th>Paid</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td></tr></tbody></table>
<ul>
<li>A straight line through 0/1 targets is easily <b>distorted</b>: one extreme income drags the whole line.</li>
<li>The line produces values below 0 and above 1, which cannot be probabilities.</li>
<li>What does a prediction of 0.37 or 1.4 even mean? The output is hard to interpret.</li>
</ul>
<p>We need a function that takes any number and squashes it into \((0,1)\).</p>
`},
    { id: 'sigmoid', title: 'The logistic (sigmoid) function', html: String.raw`
<div class="eq">\[\sigma(z)=\frac{1}{1+e^{-z}}\]</div>
<ul>
<li>Any input \(z\in(-\infty,\infty)\) produces an output in \((0,1)\): a valid probability.</li>
<li>It <b>levels off</b>: \(\sigma(z)\to1\) as \(z\to\infty\), \(\sigma(z)\to0\) as \(z\to-\infty\).</li>
<li>\(\sigma(0)=0.5\), and it is symmetric: \(\sigma(-z)=1-\sigma(z)\).</li>
<li>Its derivative is neat: \(\sigma'(z)=\sigma(z)\big(1-\sigma(z)\big)\), which makes gradients easy.</li>
</ul>
<h4>Linear regression + sigmoid = logistic regression</h4>
<p>We already know the linear score \(z=\beta_0+\beta_1x_1+\dots+\beta_nx_n\). Plug it into the sigmoid:</p>
<div class="eq">\[\hat p = P(y=1\mid x)=\sigma(\beta^\top x)=\frac{1}{1+e^{-(\beta_0+\beta_1x_1+\cdots+\beta_nx_n)}}\]</div>
<p>Treat the y-axis as the probability of class 1 and use a <b>cut-off</b>: predict 1 when \(\hat p\ge0.5\). A new person with income 1 might get \(\hat p = 0.9\), so we predict "loan paid = 1".</p>
<div class="note intuition"><b>The decision boundary is linear</b>\(\hat p\ge0.5\) exactly when \(z\ge0\), i.e. when \(\beta^\top x\ge0\). So logistic regression separates classes with a straight line (a hyperplane in more dimensions). The sigmoid only turns distance from that line into confidence.</div>
`},
    { id: 'odds', title: 'Odds and log-odds', html: String.raw`
<p>To interpret the coefficients we need <b>odds</b>: the chance an event happens divided by the chance it doesn't.</p>
<div class="eq">\[\text{odds}=\frac{p}{1-p}\]</div>
<p>\(p=0.5\) gives \(0.5/0.5=1\), "1 to 1". \(p=0.8\) gives 4, "4 to 1 in favour". Odds run from 0 to \(\infty\); the <b>log-odds</b> (logit) \(\ln\frac{p}{1-p}\) runs from \(-\infty\) to \(\infty\).</p>
<div class="viz" data-viz="odds"></div>
<h4>Rearranging the model into log-odds</h4>
<ol class="steps">
<li><span>Start from the model.</span>\[p=\frac{1}{1+e^{-z}}\]</li>
<li><span>Take the reciprocal of both sides.</span>\[\frac1p=1+e^{-z}\]</li>
<li><span>Subtract 1 and combine.</span>\[\frac{1-p}{p}=e^{-z}\]</li>
<li><span>Reciprocal again.</span>\[\frac{p}{1-p}=e^{z}\]</li>
<li><span>Take the natural log.</span>\[\boxed{\ln\frac{p}{1-p}=z=\beta_0+\beta_1x_1+\cdots+\beta_nx_n}\]</li>
</ol>
<p><b>Logistic regression models the log-odds as a linear function of the features.</b> On the log-odds axis the model is a straight line; mapped back to probability it is the S-curve. As \(p\to1\) the log-odds go to \(+\infty\); as \(p\to0\), to \(-\infty\); \(p=0.5\) sits at 0. So on the log-odds scale the class-1 points sit at \(+\infty\) and class-0 points at \(-\infty\).</p>
`},
    { id: 'interp', title: 'Interpreting the coefficients', html: String.raw`
<p>Because the log-odds scale is nonlinear in probability, a \(\beta\) cannot be read as "one unit of \(x\) adds \(\beta\) to the probability" the way it could in linear regression. What we <em>can</em> say:</p>
<ul>
<li><b>Sign</b>: positive \(\beta\) means a larger \(x\) increases the likelihood of class 1; negative \(\beta\) decreases it.</li>
<li><b>Magnitude</b>: hard to read directly, especially with mixed discrete and continuous features. But comparing magnitudes (on similarly scaled features) shows which features affect the prediction most.</li>
</ul>
<div class="note beyond"><b>Beyond the slides: the exact statement</b>A one-unit increase in \(x_j\) adds \(\beta_j\) to the log-odds, which <b>multiplies the odds by \(e^{\beta_j}\)</b>. With \(\beta_j=0.7\), each unit multiplies the odds by \(e^{0.7}\approx2.0\). The change in <em>probability</em> depends on where you start on the curve.</div>
`},
    { id: 'mle', title: 'Finding the best fit: maximum likelihood', html: String.raw`
<p>Different \(\beta\) values give different S-curves. Which is best? In linear regression we minimised RSS. Here that fails: on the log-odds axis the targets sit at \(\pm\infty\), so the residuals are infinite.</p>
<p>Logistic regression uses <b>maximum likelihood</b> (ISLR §4.3.2): <em>choose the coefficients that make the outcomes we actually observed as probable as possible.</em> Least squares for linear regression turns out to be a special case of the same principle (with Gaussian noise; see L3B).</p>
<h4>How one candidate curve is scored</h4>
<ol class="steps plain">
<li>Pick a candidate line in log-odds space and project each data point onto it to get its log-odds.</li>
<li>Convert each log-odds back to a probability with \(p=\frac{e^{z}}{1+e^{z}}\).</li>
<li>For each point, read the probability the curve gave to <b>what actually happened</b>: \(\hat p\) if the person paid, \(1-\hat p\) if they defaulted.</li>
<li>Multiply them all. That product is the <b>likelihood</b> of this curve.</li>
</ol>
<table class="tbl compact"><thead><tr><th>Person</th><th>What happened</th><th>Curve's \(\hat p\) of "pays"</th><th>Score kept</th></tr></thead><tbody>
<tr><td>A</td><td>Paid</td><td>0.9</td><td>0.9</td></tr>
<tr><td>B</td><td>Paid</td><td>0.6</td><td>0.6</td></tr>
<tr><td>C</td><td>Defaulted</td><td>0.2</td><td>1 − 0.2 = 0.8</td></tr>
</tbody></table>
<p>Likelihood = 0.9 × 0.6 × 0.8 = <b>0.43</b>. A lazy "always 0.5" curve scores only 0.5³ = 0.125, so our curve explains the data better. Maximum likelihood keeps the curve with the highest score. In general, with \(y_i\in\{0,1\}\):</p>
<div class="eq">\[L(\beta)=\prod_{i=1}^{m}\hat p_i^{\,y_i}(1-\hat p_i)^{1-y_i}\]</div>
<p>The exponent trick just selects \(\hat p_i\) when \(y_i=1\) and \(1-\hat p_i\) when \(y_i=0\). Each factor is a <b>Bernoulli</b> probability (L3B).</p>
<p>Play with \(\beta_0,\beta_1\) below. The left panel is the log-odds line, the right panel the S-curve; each point's vertical bar shows the probability it contributes. Then let gradient descent find the maximum.</p>
<div class="viz" data-viz="sigmoid"></div>
`},
    { id: 'logloss', title: 'From likelihood to log loss', html: String.raw`
<p>In practice we maximise the <b>log</b> of the likelihood:</p>
<div class="eq">\[\ln L(\beta)=\sum_{i=1}^{m}\Big[y_i\ln\hat p_i+(1-y_i)\ln(1-\hat p_i)\Big]\]</div>
<ul>
<li>A product of many numbers below 1 quickly underflows to 0 on a computer. The log turns the product into a <b>sum</b> (\(\ln(ab)=\ln a+\ln b\)).</li>
<li>\(\ln\) is increasing, so the \(\beta\) that maximises \(\ln L\) also maximises \(L\).</li>
</ul>
<div class="note trap"><b>Careful</b>The slide writes "ln(0.9)×ln(0.8)×…". The log of a product is a <b>sum</b> of logs: ln(0.9) + ln(0.8) + …</div>
<p>Gradient descent searches for <em>minimums</em>, so flip the sign and average. That gives the <b>log loss</b> (binary cross-entropy):</p>
<div class="eq">\[J(\beta)=-\frac1m\sum_{i=1}^{m}\Big[y_i\ln\hat p_i+(1-y_i)\ln(1-\hat p_i)\Big]\]</div>
<p>Minimising log loss = maximising likelihood. When \(y=1\) the loss is \(-\ln\hat p\): near 0 for a confident correct answer, exploding toward \(\infty\) for a confident wrong one.</p>
<div class="viz" data-viz="logloss"></div>
<p>"Just as with linear regression, gradient descent solves this for us." Log loss is convex, so there is one minimum. Its gradient has the <em>same shape</em> as linear regression's; only \(\hat y\) changed:</p>
<div class="eq">\[\nabla_\beta J=\frac1m X^\top\big(\sigma(X\beta)-\mathbf y\big)\]</div>
<div class="note beyond"><b>Beyond the slides: perfectly separable data</b>The lecture's income data is perfectly separable (every 0 is left of every 1). Then making the curve steeper always raises the likelihood, so \(\beta\) grows without limit and the MLE does not exist. Scikit-learn avoids this by adding an L2 penalty by default (<code>C=1.0</code>). That is Lecture 2's ridge idea again. Try it in the lab above with the "lecture data" setting.</div>
`},
    { id: 'threshold', title: 'Thresholds, precision and recall', html: String.raw`
<p>The 0.5 cut-off is a choice. Lower it and you catch more positives (higher recall) but raise false alarms (lower precision). For a cancer screen you might accept many false alarms to miss fewer cancers; for a spam filter you might do the opposite.</p>
<div class="viz" data-viz="threshold"></div>
<p class="small">Multi-class problems (car / street / bridge) extend the same idea: one-vs-rest logistic models, or the softmax function, output one probability per class.</p>
`}
  ],
  examples: [
    { title: 'Compute a probability and a class', html: String.raw`
<p>\(\beta_0=-1,\ \beta_1=2\). For \(x=1\): \(z=1\), \(\hat p=\frac{1}{1+e^{-1}}=0.731\) → class 1. For \(x=0\): \(z=-1\), \(\hat p=0.269\) → class 0. The boundary is where \(z=0\): \(x=0.5\).</p>`},
    { title: 'Odds and log-odds', html: String.raw`
<table class="tbl compact"><thead><tr><th>\(p\)</th><th>odds \(p/(1-p)\)</th><th>log-odds</th></tr></thead><tbody>
<tr><td>0.5</td><td>1</td><td>0</td></tr><tr><td>0.8</td><td>4</td><td>1.386</td></tr><tr><td>0.2</td><td>0.25</td><td>−1.386</td></tr><tr><td>0.9</td><td>9</td><td>2.197</td></tr></tbody></table>
<p>Notice the symmetry: \(p\) and \(1-p\) have log-odds of opposite sign.</p>`},
    { title: 'Likelihood of a curve (from the slides)', html: String.raw`
<p>Paid points with \(\hat p\) = 0.9, 0.8, 0.65, 0.55; defaulted points with \(\hat p\) = 0.3, 0.2, 0.08, 0.02.</p>
<p>\(L = 0.9\times0.8\times0.65\times0.55\times(1-0.3)\times(1-0.2)\times(1-0.08)\times(1-0.02)\approx\mathbf{0.13}\).</p>
<p>Log-likelihood \(=\ln0.9+\ln0.8+\dots+\ln0.98\approx-2.04\). Another \(\beta\) that gives a larger value wins.</p>`},
    { title: 'Log loss for three points', html: String.raw`
<p>From the A/B/C table: probabilities of what happened are 0.9, 0.6, 0.8.</p>
<p>\(J=-\frac13(\ln0.9+\ln0.6+\ln0.8)=-\frac13(-0.105-0.511-0.223)=\mathbf{0.280}\).</p>
<p>The "always 0.5" model: \(J=-\ln0.5=0.693\). Lower loss = better.</p>`},
    { title: 'Reading a coefficient', html: String.raw`
<p>A loan model has \(\beta_{\text{income}}=0.7\). Positive: higher income raises the probability of repaying. Each unit of income adds 0.7 to the log-odds, multiplying the odds by \(e^{0.7}\approx2.01\). If odds were 1:1 (p = 0.5), one more unit makes them about 2:1 (p ≈ 0.67).</p>`},
    { title: 'Precision, recall, F1', html: String.raw`
<p>A spam filter flags 50 emails: 40 are spam (TP), 10 are not (FP). It misses 20 spam emails (FN).</p>
<p>Precision = 40/50 = 0.80. Recall = 40/60 = 0.667. F1 = 2(0.8)(0.667)/(0.8+0.667) = <b>0.727</b>.</p>`},
    { title: 'The derivative of the sigmoid', html: String.raw`
<p>\(\sigma(z)=(1+e^{-z})^{-1}\). Chain rule: \(\sigma'(z)=(1+e^{-z})^{-2}e^{-z}=\frac{1}{1+e^{-z}}\cdot\frac{e^{-z}}{1+e^{-z}}=\sigma(z)(1-\sigma(z))\). At \(z=0\): \(0.5\times0.5=0.25\), the steepest point of the curve.</p>`}
  ],
  summary: {
    big: 'Logistic regression is a classifier. It passes the linear score z = βᵀx through the sigmoid σ(z) = 1/(1+e^{−z}) to get P(y=1|x), and predicts class 1 when p̂ ≥ 0.5 (i.e. z ≥ 0, a linear boundary). Equivalently, it models the log-odds ln(p/(1−p)) as linear in x. Coefficients are fit by maximum likelihood, implemented as minimising the convex log loss with gradient descent.',
    concepts: [
      'Logistic regression is classification, despite its name.',
      'Linear regression fails on 0/1 targets: distorted by extremes, outputs outside [0,1], hard to interpret.',
      'Sigmoid maps (−∞, ∞) to (0, 1); σ(0) = 0.5; σ(−z) = 1 − σ(z); σ′ = σ(1 − σ).',
      'p̂ = σ(β₀ + β₁x₁ + …); threshold 0.5 ⇔ βᵀx ≥ 0: a linear decision boundary.',
      'Odds = p/(1 − p); log-odds = ln(odds) = βᵀx (linear in the features).',
      'On the log-odds axis, class-1 points are at +∞ and class-0 at −∞, so RSS is unusable.',
      'Coefficient sign gives direction; e^β is the odds multiplier per unit of x.',
      'Maximum likelihood: choose β making the observed labels most probable; L = Π p̂^y (1 − p̂)^{1−y}.',
      'Maximise the log-likelihood (a sum) to avoid underflow; minimise log loss for gradient descent.',
      'Gradient of log loss: (1/m)Xᵀ(σ(Xβ) − y), same form as linear regression.',
      'Classification metrics: precision TP/(TP+FP), recall TP/(TP+FN), F1 harmonic mean.'
    ],
    terms: [
      ['Logistic regression', 'Classification model p̂ = σ(βᵀx) predicting the probability of class 1.'],
      ['Sigmoid / logistic function', 'σ(z) = 1/(1+e^{−z}); squashes any real number into (0,1).'],
      ['Decision threshold', 'Cut-off on p̂ (default 0.5) used to turn a probability into a class.'],
      ['Decision boundary', 'Set where p̂ = 0.5, i.e. βᵀx = 0; linear for logistic regression.'],
      ['Odds', 'p/(1 − p): chance of the event over chance of no event.'],
      ['Log-odds (logit)', 'ln(p/(1 − p)); logistic regression makes it linear in x.'],
      ['Likelihood', 'Probability the model assigns to the observed data, as a function of β.'],
      ['Maximum likelihood estimation (MLE)', 'Choosing parameters that maximise the likelihood of the observed data.'],
      ['Log-likelihood', 'Sum of log probabilities; maximised instead of the raw product.'],
      ['Log loss / cross-entropy', '−(1/m)Σ[y ln p̂ + (1−y) ln(1−p̂)]; minimised by gradient descent.'],
      ['Discretization', 'Turning a continuous target into classes by binning.'],
      ['Confusion matrix', 'Table of TP, FP, FN, TN counts.'],
      ['Precision', 'TP/(TP+FP): how many flagged positives are correct.'],
      ['Recall', 'TP/(TP+FN): how many real positives are caught.'],
      ['F1 score', 'Harmonic mean of precision and recall.']
    ],
    formulas: [
      ['Sigmoid', String.raw`\sigma(z)=\frac{1}{1+e^{-z}},\quad \sigma'(z)=\sigma(z)(1-\sigma(z))`],
      ['Model', String.raw`\hat p=P(y=1\mid x)=\sigma(\beta^\top x)`],
      ['Odds / log-odds', String.raw`\text{odds}=\frac{p}{1-p},\quad \ln\frac{p}{1-p}=\beta^\top x`],
      ['Inverse (log-odds → p)', String.raw`p=\frac{e^{z}}{1+e^{z}}`],
      ['Likelihood', String.raw`L(\beta)=\prod_i \hat p_i^{\,y_i}(1-\hat p_i)^{1-y_i}`],
      ['Log loss', String.raw`J(\beta)=-\frac1m\sum_i\big[y_i\ln\hat p_i+(1-y_i)\ln(1-\hat p_i)\big]`],
      ['Gradient', String.raw`\nabla J=\frac1m X^\top(\sigma(X\beta)-\mathbf y)`],
      ['Metrics', String.raw`P=\frac{TP}{TP+FP},\ R=\frac{TP}{TP+FN},\ F_1=\frac{2PR}{P+R}`]
    ],
    traps: [
      'Logistic "regression" is a classification algorithm.',
      'β is not the change in probability per unit of x; it is the change in log-odds.',
      'The decision boundary of logistic regression is linear (the curve is in probability, not in feature space).',
      'The log of a product is a sum of logs, not a product of logs.',
      'We maximise likelihood but minimise log loss; they are the same objective with opposite sign.',
      'RSS cannot be used because log-odds targets are ±∞.',
      'With perfectly separable data the unregularised MLE does not exist (β → ∞).'
    ],
    recall: [
      ['Write the sigmoid and its range.', 'σ(z) = 1/(1+e^{−z}); outputs in (0, 1), σ(0) = 0.5.'],
      ['Derive the log-odds form from p = σ(z).', '1/p = 1+e^{−z} → (1−p)/p = e^{−z} → p/(1−p) = e^{z} → ln(p/(1−p)) = z.'],
      ['Why is RSS unsuitable for fitting logistic regression?', 'On the log-odds scale targets are at ±∞, giving infinite residuals.'],
      ['How is the likelihood of a candidate curve computed?', 'Multiply p̂ for each y = 1 point and (1 − p̂) for each y = 0 point.'],
      ['Why use the log-likelihood?', 'Turns the product into a sum (no underflow) and has the same maximiser.'],
      ['Write the log loss.', '−(1/m)Σ[y ln p̂ + (1 − y) ln(1 − p̂)].'],
      ['What does a negative coefficient mean?', 'Increasing that feature decreases the probability of class 1.'],
      ['Define precision and recall.', 'Precision TP/(TP+FP); recall TP/(TP+FN).']
    ]
  },
  quiz: [
    { q: 'Logistic regression is primarily used for…', o: ['Predicting continuous values', 'Classification', 'Clustering', 'Dimensionality reduction'], a: 1, e: 'It predicts categorical labels through class probabilities.' },
    { q: String.raw`What is \(\sigma(0)\)?`, o: ['0', '0.5', '1', 'e'], a: 1, e: String.raw`\(1/(1+e^0)=1/2\).` },
    { q: 'An event has probability 0.75. Its odds are…', o: ['0.75', '1.33', '3', '0.25'], a: 2, e: '0.75 / 0.25 = 3, i.e. 3 to 1.' },
    { q: 'Logistic regression models which quantity as a linear function of the features?', o: ['The probability p', 'The odds', 'The log-odds ln(p/(1−p))', 'The residual'], a: 2, e: 'ln(p/(1−p)) = β₀ + β₁x₁ + …' },
    { q: 'With threshold 0.5, logistic regression predicts class 1 exactly when…', o: ['βᵀx ≥ 0', 'βᵀx ≥ 0.5', 'βᵀx ≥ 1', 'x ≥ 0'], a: 0, e: 'σ(z) ≥ 0.5 ⇔ z ≥ 0, giving a linear decision boundary.' },
    { q: 'Why can\'t logistic regression be fit by minimising RSS on the log-odds scale?', o: ['RSS is not convex', 'Observed classes sit at ±∞ in log-odds, so residuals are infinite', 'RSS needs labels', 'It can, it just is slow'], a: 1, e: 'p = 1 maps to +∞ and p = 0 to −∞.' },
    { q: 'Three points: two paid (p̂ = 0.9, 0.6) and one defaulted (p̂ = 0.2). The likelihood is…', o: ['0.108', '0.432', '0.54', '1.7'], a: 1, e: '0.9 × 0.6 × (1 − 0.2) = 0.432.' },
    { q: 'Why do we maximise the log-likelihood rather than the likelihood?', o: ['It gives a different, better β', 'It turns a product into a sum, avoiding numerical underflow, with the same maximiser', 'Logs make it non-convex', 'It removes the need for gradient descent'], a: 1, e: 'ln is monotonic, so the argmax is unchanged.' },
    { q: 'A coefficient β = −1.2 for feature x means…', o: ['Larger x raises P(y=1)', 'Larger x lowers P(y=1)', 'x is irrelevant', 'P(y=1) drops by 1.2 per unit'], a: 1, e: 'The sign gives the direction; the change is in log-odds, not probability.' },
    { q: 'A classifier has TP = 30, FP = 10, FN = 30. Its recall is…', o: ['0.75', '0.5', '0.33', '0.6'], a: 1, e: 'Recall = 30/(30+30) = 0.5. (Precision = 30/40 = 0.75.)' },
    { q: String.raw`The derivative \(\sigma'(z)\) equals…`, o: [String.raw`\(\sigma(z)^2\)`, String.raw`\(\sigma(z)(1-\sigma(z))\)`, String.raw`\(e^{-z}\)`, String.raw`\(1-\sigma(z)\)`], a: 1, e: 'A classic identity that makes the log-loss gradient simplify.' }
  ]
});
