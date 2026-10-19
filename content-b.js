/* Lecture content: L3B, L4, L5 */
window.LECTURES = window.LECTURES || [];

/* ------------------------------------------------------------------ L3B */
LECTURES.push({
  id: 'l3b', code: 'L3B', short: 'Probability Review', title: 'Probability Theory Review',
  thesis: 'Probability is the framework for quantifying uncertainty, and the language behind likelihood, Bayes and every model that outputs a confidence.',
  learn: [
    { id: 'why', title: 'Why probability in machine learning?', html: String.raw`
<p>Uncertainty is everywhere in ML. Datasets are <b>finite</b>, so we never see the whole population, and measurements carry <b>noise</b>. Probability theory is the framework for quantifying and manipulating that uncertainty, and it is one of the central foundations of the field. You already used it: the likelihood in logistic regression is a product of probabilities, and the irreducible error \(\sigma^2\) in Lecture 2 is a variance.</p>
`},
    { id: 'basics', title: 'Experiments, sample spaces, events', html: String.raw`
<ul>
<li><b>Experiment</b>: a process with an uncertain outcome. Toss a coin twice.</li>
<li><b>Sample space</b> \(S\): all possible outcomes. \(S=\{HH, HT, TH, TT\}\).</li>
<li><b>Event</b>: a subset of outcomes. \(A=\{HH\}\) ("two heads"), \(B=\{HT,TH\}\) ("exactly one head").</li>
<li><b>Probability</b> \(\Pr(A)\): a number assigned to an event.</li>
</ul>
<h4>The three axioms (Kolmogorov)</h4>
<ol class="steps plain">
<li>\(\Pr(A)\ge0\) for every event.</li>
<li>\(\Pr(S)=1\): something in the sample space always happens.</li>
<li>For disjoint (mutually exclusive) events \(A_1,A_2,\dots\): \(\Pr\big(\bigcup_i A_i\big)=\sum_i\Pr(A_i)\).</li>
</ol>
<p><b>Frequentist view</b>: repeat the experiment \(N\) times and count how often \(A\) happens, \(n(A)\). Then \(\Pr(A)\approx n(A)/N\), exactly so as \(N\to\infty\).</p>
`},
    { id: 'jcm', title: 'Joint, conditional and marginal probability', html: String.raw`
<ul>
<li><b>Joint</b> \(\Pr(A,B)\) or \(\Pr(AB)\): both events happen.</li>
<li><b>Conditional</b> \(\Pr(B\mid A)\): \(B\) happens <em>given that</em> \(A\) happened.</li>
<li><b>Marginal</b> \(\Pr(A)\): probability of \(A\) alone, found by summing the joint over everything else.</li>
</ul>
<h4>Bishop's boxes of fruit</h4>
<p>A red box holds 2 apples and 6 oranges; a blue box holds 3 apples and 1 orange. Pick the red box 40% of the time, the blue box 60%, then draw a fruit at random.</p>
<ul>
<li><b>Joint</b>: \(P(B=b, F=o)=P(F=o\mid B=b)\,P(B=b)=\tfrac14\times0.6=0.15\).</li>
<li><b>Marginal</b>: \(P(F=a)=P(a\mid r)P(r)+P(a\mid b)P(b)=\tfrac28(0.4)+\tfrac34(0.6)=0.1+0.45=0.55\). Note we had to consider \(P(B)\).</li>
<li><b>Conditional</b>: given we got an orange, which box? \(P(B=b\mid F=o)=\frac{P(b,o)}{P(o)}=\frac{0.15}{0.45}=\tfrac13\).</li>
</ul>
<p>These use the two rules everything else is built from:</p>
<div class="eq">\[\text{Sum rule: } P(X)=\sum_Y P(X,Y)\qquad\text{Product rule: } P(X,Y)=P(Y\mid X)\,P(X)\]</div>
`},
    { id: 'indep', title: 'Independence and conditioning', html: String.raw`
<p>Two events are <b>independent</b> if knowing one tells you nothing about the other:</p>
<div class="eq">\[\Pr(AB)=\Pr(A)\Pr(B)\qquad\Longleftrightarrow\qquad\Pr(A\mid B)=\Pr(A)\]</div>
<p>A set of events is independent if this holds for every subset: \(\Pr\big(\bigcap_{i\in K}A_i\big)=\prod_{i\in K}\Pr(A_i)\).</p>
<p><b>Coins</b>: Pr(1st is H and 2nd is H) = 0.5 × 0.5 = 0.25 because tosses are independent. But for \(A=\{HH\}\) and \(B=\{HT,TH\}\), \(\Pr(AB)=0\): they cannot both happen. Disjoint is <em>not</em> the same as independent; disjoint events with positive probability are always <em>dependent</em>.</p>
<h4>Conditional probability</h4>
<div class="eq">\[\Pr(B\mid A)=\frac{\Pr(AB)}{\Pr(A)},\qquad \Pr(A)\gt0\]</div>
<p>Conditioning shrinks the world to the outcomes where \(A\) happened and asks what fraction of <em>those</em> also have \(B\). Explore the diagnostic test table from the slides. Edit any count.</p>
<div class="viz" data-viz="table2x2"></div>
`},
    { id: 'bayes', title: "Bayes' rule", html: String.raw`
<p>Usually we know \(\Pr(\text{Evidence}\mid\text{Hypothesis})\) (how a disease produces a positive test) but want the reverse, \(\Pr(\text{Hypothesis}\mid\text{Evidence})\) (does this positive patient have the disease?). Bayes' rule flips the condition:</p>
<div class="eq">\[\underbrace{\Pr(H\mid E)}_{\text{posterior}}=\frac{\overbrace{\Pr(E\mid H)}^{\text{likelihood}}\;\overbrace{\Pr(H)}^{\text{prior}}}{\underbrace{\Pr(E)}_{\text{evidence}}},\qquad \Pr(E)=\Pr(E\mid H)\Pr(H)+\Pr(E\mid\neg H)\Pr(\neg H)\]</div>
<ul>
<li><b>Prior</b>: what you believed before seeing the evidence.</li>
<li><b>Likelihood</b>: how probable the evidence is if the hypothesis is true ("information").</li>
<li><b>Posterior</b>: your updated belief after the evidence ("inference").</li>
</ul>
<p>Each dot below is one person out of 1000. Lower the prevalence and watch the posterior collapse even with an accurate test: the false positives from the large healthy group swamp the true positives. This is the <b>base-rate fallacy</b>.</p>
<div class="viz" data-viz="bayes"></div>
`},
    { id: 'rv', title: 'Random variables and distributions', html: String.raw`
<p>A <b>random variable</b> \(X\) is a numerical outcome of a random experiment. A coin's outcomes "Head" and "Tail" are not numbers, so we define \(x=1\) for Head and \(x=0\) for Tail. Each value has an associated probability.</p>
<p>The <b>probability distribution</b> is the collection of possible values with their probabilities, written with parameters \(\theta\):</p>
<ul>
<li><b>Discrete</b>: a probability mass function \(\Pr(X=x\mid\theta)\), with \(\sum_x\Pr(X=x)=1\).</li>
<li><b>Continuous</b>: a probability density \(p(x\mid\theta)\) with \(\int p(x)\,dx=1\); probabilities are areas, \(\Pr(a\le X\le b)=\int_a^b p(x)dx\).</li>
</ul>
<h4>Three dice</h4>
<p>Let \(X\) be the sum of three dice. Possible values: 3, 4, …, 18. For \(\Pr(X=5)\) list the sequences: (1,1,3), (1,3,1), (3,1,1), (1,2,2), (2,1,2), (2,2,1). That's 6 of the \(6^3=216\) equally likely sequences, so \(\Pr(X=5)=6/216=1/36\).</p>
<div class="viz" data-viz="dice"></div>
`},
    { id: 'expect', title: 'Expectation', html: String.raw`
<p>The <b>expectation</b> is the weighted average of the values \(X\) can take, each weighted by its probability: the long-run average.</p>
<div class="eq">\[\mathbb E[X]=\sum_x x\Pr(X=x)\ \ (\text{discrete}),\qquad \mathbb E[X]=\int x\,p(x)\,dx\ \ (\text{continuous})\]</div>
<p>Example: \(P(X=1)=0.5,\ P(X=2)=0.25,\ P(X=3)=0.25\). \(\mathbb E[X]=0.5(1)+0.25(2)+0.25(3)=1.75\).</p>
<p>With only a sample \(x_1,\dots,x_N\) and no distribution, use the <b>sample mean</b> \(\bar x=\frac1N\sum_i x_i\): each value weighted by its frequency instead of its probability.</p>
<h4>Rules of expectation</h4>
<ul>
<li><b>Sum</b> (always true, even for dependent variables): \(\mathbb E[X_1+X_2]=\mathbb E[X_1]+\mathbb E[X_2]\).</li>
<li><b>Product</b> (needs independence): \(\mathbb E[X_1X_2]=\mathbb E[X_1]\,\mathbb E[X_2]\) if \(X_1, X_2\) are independent.</li>
</ul>
<p>Three dice: one die has \(\mathbb E=3.5\). The sum has \(\mathbb E=3.5+3.5+3.5=10.5\). The rolls are independent, so the product has \(\mathbb E=3.5^3=42.875\).</p>
`},
    { id: 'var', title: 'Variance and covariance', html: String.raw`
<p><b>Variance</b> measures how spread out a random variable is around its mean \(\mu\):</p>
<div class="eq">\[\text{Var}(X)=\mathbb E\big[(X-\mu)^2\big]=\mathbb E[X^2]-\mu^2,\qquad \sigma=\sqrt{\text{Var}(X)}\]</div>
<p>From data: <b>population variance</b> \(\frac1N\sum(x_i-\mu)^2\); <b>sample variance</b> \(\frac{1}{N-1}\sum(x_i-\bar x)^2\) (dividing by \(N-1\) corrects for estimating the mean from the same data).</p>
<p>Both sets below have mean 36, yet \(\{2, 50, 9, 4, 23, 65, 99\}\) has population variance ≈ 1155 (\(\sigma\approx34\)) while \(\{33,\dots,39\}\) has variance 4 (\(\sigma=2\)). Same centre, very different spread.</p>
<p><b>Covariance</b> measures how two variables vary together:</p>
<div class="eq">\[\text{Cov}(X,Y)=\mathbb E\big[(X-\mu_X)(Y-\mu_Y)\big],\qquad \widehat{\text{Cov}}=\frac{1}{N-1}\sum_i(x_i-\bar x)(y_i-\bar y)\]</div>
<p>Positive: they rise together. Negative: one rises as the other falls. Zero: no <em>linear</em> relationship. (Independence implies zero covariance, but zero covariance does not imply independence: \(Y=X^2\) with symmetric \(X\) has Cov = 0.)</p>
`},
    { id: 'dists', title: 'Bernoulli and Gaussian distributions', html: String.raw`
<h4>Bernoulli: one trial, two outcomes</h4>
<p>Success (1) with probability \(\theta\), failure (0) with \(1-\theta\). One compact formula covers both cases:</p>
<div class="eq">\[\Pr(X=x\mid\theta)=\theta^{x}(1-\theta)^{1-x},\quad x\in\{0,1\},\qquad \mathbb E[X]=\theta,\ \ \text{Var}(X)=\theta(1-\theta)\]</div>
<p>This is exactly the factor inside logistic regression's likelihood, with \(\theta=\hat p_i\).</p>
<h4>Gaussian (normal): the bell curve</h4>
<div class="eq">\[X\sim\mathcal N(\mu,\sigma^2):\quad p(x)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big(-\frac{(x-\mu)^2}{2\sigma^2}\Big),\qquad \mathbb E[X]=\mu,\ \ \text{Var}(X)=\sigma^2\]</div>
<p>About 68% of the mass lies within \(\mu\pm\sigma\), 95% within \(\pm2\sigma\), 99.7% within \(\pm3\sigma\). If \(X_1\sim\mathcal N(\mu_1,\sigma_1^2)\) and \(X_2\sim\mathcal N(\mu_2,\sigma_2^2)\) are independent, then \(X_1+X_2\) is Gaussian as well, with mean \(\mu_1+\mu_2\) and variance \(\sigma_1^2+\sigma_2^2\). Variances add; standard deviations don't.</p>
<div class="viz" data-viz="dist"></div>
<div class="note beyond"><b>Why this matters: the bridge to MLE</b>If \(y=\beta^\top x+\varepsilon\) with Gaussian noise \(\varepsilon\sim\mathcal N(0,\sigma^2)\), maximising the likelihood of the data gives exactly least squares, because \(\ln p\) of a Gaussian is \(-\frac{(y-\beta^\top x)^2}{2\sigma^2}+\text{const}\). With Bernoulli labels, maximising the likelihood gives logistic regression's log loss. One principle (MLE), two noise models, two familiar costs.</div>
`}
  ],
  examples: [
    { title: 'Diagnostic test: independence check', html: String.raw`
<p>Table: Disease & Test+ 1800, Disease & Test− 200, Healthy & Test+ 200, Healthy & Test− 1800 (total 4000). \(A\) = disease, \(B\) = positive.</p>
<p>\(\Pr(A)=2000/4000=0.5\), \(\Pr(B)=2000/4000=0.5\), \(\Pr(AB)=1800/4000=0.45\). Since \(0.45\ne0.5\times0.5=0.25\), \(A\) and \(B\) are <b>dependent</b>.</p>
<p>\(\Pr(B\mid A)=0.45/0.5=0.9\) (sensitivity) and \(\Pr(A\mid B)=0.45/0.5=0.9\). They match here only because \(\Pr(A)=\Pr(B)\).</p>`},
    { title: 'Bayes with a rare disease', html: String.raw`
<p>Prevalence 1%, sensitivity \(P(+\mid D)=0.9\), false-positive rate \(P(+\mid\neg D)=0.1\).</p>
<p>\(P(+)=0.9(0.01)+0.1(0.99)=0.009+0.099=0.108\).</p>
<p>\(P(D\mid+)=\frac{0.009}{0.108}=\mathbf{0.083}\). A positive result means only an 8% chance of disease, because healthy people vastly outnumber sick ones.</p>`},
    { title: 'Expectation and variance of a discrete variable', html: String.raw`
<p>\(P(X=1)=0.5,\,P(X=2)=0.25,\,P(X=3)=0.25\).</p>
<p>\(\mathbb E[X]=1.75\). \(\mathbb E[X^2]=0.5(1)+0.25(4)+0.25(9)=3.75\). \(\text{Var}(X)=3.75-1.75^2=3.75-3.0625=\mathbf{0.6875}\).</p>`},
    { title: 'Population variance by hand', html: String.raw`
<p>\(\{2,50,9,4,23,65,99\}\): sum 252, mean 36. Deviations −34, 14, −27, −32, −13, 29, 63; squares 1156, 196, 729, 1024, 169, 841, 3969; total 8084. Variance = 8084/7 ≈ <b>1154.9</b>, \(\sigma\approx34.0\).</p>
<p>\(\{33,\dots,39\}\): squared deviations 9, 4, 1, 0, 1, 4, 9 = 28. Variance = 28/7 = <b>4</b>, \(\sigma=2\).</p>`},
    { title: 'Bernoulli and sums of Gaussians', html: String.raw`
<p>Coin with \(\theta=0.3\): \(\Pr(X=1)=0.3^1\cdot0.7^0=0.3\), \(\Pr(X=0)=0.3^0\cdot0.7^1=0.7\). \(\mathbb E=0.3\), Var = 0.3 × 0.7 = 0.21.</p>
<p>\(X_1\sim\mathcal N(2,9)\), \(X_2\sim\mathcal N(5,16)\) independent: \(X_1+X_2\sim\mathcal N(7,25)\), so \(\sigma=5\), not \(3+4=7\).</p>`},
    { title: 'Three dice', html: String.raw`
<p>\(\Pr(X=5)=6/216\approx0.028\). \(\Pr(X=3)=1/216\) (only 1,1,1). Most likely sums: 10 and 11, each 27/216 = 0.125. \(\mathbb E[\text{sum}]=10.5\); \(\mathbb E[\text{product}]=42.875\).</p>`}
  ],
  summary: {
    big: 'Probability quantifies uncertainty from finite, noisy data. Events live in a sample space and obey three axioms. Joint, conditional and marginal probabilities are linked by the sum and product rules; Bayes\' rule turns likelihood × prior into a posterior. Random variables have distributions summarised by expectation and variance. Bernoulli (one binary trial) and Gaussian (bell curve) underpin logistic regression and least squares through maximum likelihood.',
    concepts: [
      'Experiment, sample space S, event (subset of S), probability Pr(A).',
      'Axioms: Pr(A) ≥ 0; Pr(S) = 1; additivity for disjoint events. Frequentist: Pr(A) = n(A)/N.',
      'Joint Pr(A,B); conditional Pr(B|A) = Pr(AB)/Pr(A); marginal by summing out the other variable.',
      'Sum rule P(X) = Σ_Y P(X,Y); product rule P(X,Y) = P(Y|X)P(X).',
      'Independence: Pr(AB) = Pr(A)Pr(B) ⇔ Pr(A|B) = Pr(A). Disjoint ≠ independent.',
      'Bayes: posterior = likelihood × prior / evidence. Beware the base rate.',
      'Random variable: numerical outcome; distribution = values + probabilities, parameterised by θ.',
      'E[X] = Σ x P(x); linearity always; E[XY] = E[X]E[Y] only when independent.',
      'Var(X) = E[(X − μ)²] = E[X²] − μ²; sample variance divides by N − 1.',
      'Covariance measures joint variation; zero covariance does not imply independence.',
      'Bernoulli: θˣ(1−θ)^{1−x}, mean θ, variance θ(1−θ).',
      'Gaussian N(μ, σ²); sum of independent Gaussians is Gaussian with summed means and variances.'
    ],
    terms: [
      ['Sample space', 'Set of all possible outcomes of an experiment.'],
      ['Event', 'A subset of the sample space.'],
      ['Joint probability', 'Probability that both events happen, Pr(A,B).'],
      ['Conditional probability', 'Pr(B|A) = Pr(AB)/Pr(A): probability of B given A happened.'],
      ['Marginal probability', 'Probability of one variable alone, summing the joint over the others.'],
      ['Independent events', 'Pr(AB) = Pr(A)Pr(B); one gives no information about the other.'],
      ['Prior', 'Probability of a hypothesis before observing evidence.'],
      ['Likelihood', 'Pr(evidence | hypothesis).'],
      ['Posterior', 'Probability of the hypothesis after observing evidence.'],
      ['Random variable', 'A numerical outcome of a random experiment.'],
      ['Probability distribution', 'Possible values of a random variable with their probabilities.'],
      ['Expectation', 'Probability-weighted average of a random variable.'],
      ['Variance', 'Expected squared deviation from the mean.'],
      ['Covariance', 'Expected product of deviations of two variables; measures joint variation.'],
      ['Bernoulli distribution', 'One trial, outcome 1 with probability θ, 0 with 1 − θ.'],
      ['Gaussian distribution', 'Bell-shaped distribution with mean μ and variance σ².']
    ],
    formulas: [
      ['Conditional', String.raw`\Pr(B\mid A)=\frac{\Pr(AB)}{\Pr(A)}`],
      ['Independence', String.raw`\Pr(AB)=\Pr(A)\Pr(B)`],
      ['Sum & product rules', String.raw`P(X)=\sum_YP(X,Y),\quad P(X,Y)=P(Y\mid X)P(X)`],
      ['Bayes', String.raw`\Pr(H\mid E)=\frac{\Pr(E\mid H)\Pr(H)}{\Pr(E)}`],
      ['Expectation', String.raw`\mathbb E[X]=\sum_x x\Pr(X=x),\quad \bar x=\tfrac1N\textstyle\sum x_i`],
      ['Linearity / product', String.raw`\mathbb E[X_1+X_2]=\mathbb E[X_1]+\mathbb E[X_2];\ \ \mathbb E[X_1X_2]=\mathbb E[X_1]\mathbb E[X_2]\ (\text{indep.})`],
      ['Variance', String.raw`\text{Var}(X)=\mathbb E[(X-\mu)^2]=\mathbb E[X^2]-\mu^2`],
      ['Covariance', String.raw`\text{Cov}(X,Y)=\mathbb E[(X-\mu_X)(Y-\mu_Y)]`],
      ['Bernoulli', String.raw`\Pr(X=x)=\theta^x(1-\theta)^{1-x},\ \mathbb E=\theta,\ \text{Var}=\theta(1-\theta)`],
      ['Gaussian', String.raw`p(x)=\frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}`]
    ],
    traps: [
      'Pr(A|B) and Pr(B|A) are different in general; Bayes connects them.',
      'Disjoint events are not independent (unless one has probability 0).',
      'E[XY] = E[X]E[Y] requires independence; E[X + Y] = E[X] + E[Y] does not.',
      'Variances of independent variables add; standard deviations do not.',
      'Zero covariance does not imply independence.',
      'For continuous variables, p(x) is a density (can exceed 1); probabilities are areas.'
    ],
    recall: [
      ['State the three axioms of probability.', 'Pr(A) ≥ 0; Pr(S) = 1; Pr of a union of disjoint events is the sum of their probabilities.'],
      ['Define conditional probability.', 'Pr(B|A) = Pr(AB)/Pr(A), for Pr(A) > 0.'],
      ['How do you test independence from a table?', 'Check whether Pr(AB) equals Pr(A)Pr(B).'],
      ['Write Bayes\' rule and name its parts.', 'Posterior Pr(H|E) = likelihood Pr(E|H) × prior Pr(H) / evidence Pr(E).'],
      ['Pr(sum of three dice = 5)?', '6/216 = 1/36.'],
      ['Mean and variance of Bernoulli(θ)?', 'θ and θ(1 − θ).'],
      ['Distribution of X₁ + X₂ for independent Gaussians?', 'Gaussian with mean μ₁ + μ₂ and variance σ₁² + σ₂².']
    ]
  },
  quiz: [
    { q: 'Toss a coin twice. A = {HH}, B = {HT, TH}. Pr(AB) is…', o: ['0.25', '0.5', '0', '0.125'], a: 2, e: 'A and B share no outcomes; they are disjoint.' },
    { q: 'Events A and B are independent if…', o: ['Pr(AB) = 0', 'Pr(AB) = Pr(A)Pr(B)', 'Pr(A) = Pr(B)', 'Pr(A|B) = Pr(B|A)'], a: 1, e: 'Equivalently Pr(A|B) = Pr(A).' },
    { q: 'Pr(A) = 0.5, Pr(B) = 0.5, Pr(AB) = 0.45. Then Pr(B|A) =', o: ['0.45', '0.9', '0.25', '0.5'], a: 1, e: '0.45 / 0.5 = 0.9.' },
    { q: 'In Bayes\' rule, Pr(H) is called the…', o: ['Posterior', 'Likelihood', 'Prior', 'Evidence'], a: 2, e: 'The belief before observing evidence.' },
    { q: 'P(X=1)=0.5, P(X=2)=0.25, P(X=3)=0.25. E[X] =', o: ['2', '1.75', '1.5', '2.25'], a: 1, e: '0.5 + 0.5 + 0.75 = 1.75.' },
    { q: 'For three fair dice, E[product of the faces] equals…', o: ['10.5', '42.875', '216', 'Cannot be computed'], a: 1, e: 'Independent rolls: 3.5³ = 42.875.' },
    { q: 'Var(X) for a Bernoulli variable with θ = 0.5 is…', o: ['0.5', '0.25', '1', '0'], a: 1, e: 'θ(1 − θ) = 0.25, the maximum possible.' },
    { q: 'X₁ ~ N(1, 4) and X₂ ~ N(3, 5) independent. X₁ + X₂ ~', o: ['N(4, 9)', 'N(4, 3)', 'N(2, 9)', 'Not Gaussian'], a: 0, e: 'Means add: 4. Variances add: 9.' },
    { q: 'A disease has prevalence 1%. A test is 90% sensitive with a 10% false-positive rate. P(disease | positive) is about…', o: ['90%', '50%', '8%', '1%'], a: 2, e: '0.009 / (0.009 + 0.099) ≈ 0.083.' },
    { q: 'Which statement is always true?', o: ['E[XY] = E[X]E[Y]', 'E[X + Y] = E[X] + E[Y]', 'Var(X + Y) = Var(X) + Var(Y)', 'Cov = 0 implies independence'], a: 1, e: 'Linearity of expectation needs no independence.' }
  ]
});

/* ------------------------------------------------------------------ L4 */
LECTURES.push({
  id: 'l4', code: 'L4', short: 'Decision Trees', title: 'Classification Algorithms: Decision Trees',
  thesis: 'Cut the feature space into rectangles with if-then rules, choosing each cut greedily to make the pieces as pure as possible.',
  learn: [
    { id: 'family', title: 'Tree-based methods and their history', html: String.raw`
<p>Three main tree-based methods: <b>decision trees</b> (today), <b>random forests</b> and <b>boosted trees</b>. The last two are ensembles of many trees, so a solid understanding of one tree comes first.</p>
<p>Two different things share the name "decision tree":</p>
<ul>
<li><b>Decision analysis tree</b>: drawn by a person to map choices, chances and outcomes (a coin flip branching to Heads/Tails with P = 0.5 each).</li>
<li><b>Decision tree learning</b>: the structure and rules are <em>learned automatically from data</em>, with node splits chosen by an information metric. That needs a mathematical definition of <b>information</b>.</li>
</ul>
<p>That definition comes from <b>Claude Shannon</b>, the father of information theory ("A Mathematical Theory of Communication", 1948).</p>
<div class="timeline">
<div><b>1963</b><span>AID. Morgan &amp; Sonquist: the first regression tree, a piecewise-constant model</span></div>
<div><b>1984</b><span>CART. Breiman, Friedman, Olshen &amp; Stone: binary trees, Gini, pruning</span></div>
<div><b>1986</b><span>ID3. Quinlan: entropy and information gain</span></div>
<div><b>1993</b><span>C4.5. Quinlan: continuous features, missing values, pruning</span></div>
<div><b>2001</b><span>Random Forests. Breiman: average many randomised trees</span></div>
<div><b>2016</b><span>XGBoost. Chen &amp; Guestrin: fast gradient-boosted trees</span></div>
</div>
<p class="small">Scikit-learn uses an optimised CART: binary splits, Gini or entropy for classification, squared error for regression. This lecture follows that approach.</p>
`},
    { id: 'regtree', title: 'The first regression tree', html: String.raw`
<p>A regression tree chops the \(x\)-axis into intervals and predicts a <b>constant</b> in each: a staircase. Each leaf predicts the <b>average</b> of the training responses in its region.</p>
<h4>How it chooses a split</h4>
<p>For a split "\(X\le s\)" producing regions \(R_1\) and \(R_2\), compute the residual sum of squares around each region's mean:</p>
<div class="eq">\[\text{RSS}(s)=\sum_{i:\,x_i\in R_1}(y_i-\bar y_{R_1})^2+\sum_{i:\,x_i\in R_2}(y_i-\bar y_{R_2})^2\]</div>
<p>Try every candidate \(s\) (and every feature), keep the lowest RSS, then repeat inside each region. This is <b>recursive binary splitting</b>. It is <b>greedy</b> and <b>top-down</b>: take the best split now without looking ahead. Finding the globally best tree is NP-hard, so greedy is the practical choice.</p>
<div class="viz" data-viz="regTree"></div>
<p>Classification trees follow exactly the same recipe. Only RSS is replaced by an <b>impurity</b> measure.</p>
`},
    { id: 'anatomy', title: 'Anatomy of a tree', html: String.raw`
<div class="tree-fig" aria-label="Example tree: root X ≤ 1; true branch leaf Y = 1.5; false branch node X ≤ 2 with leaves Y = 2.2 and Y = 1.5">
<svg viewBox="0 0 420 220" role="img"><title>Example decision tree</title>
<g class="tf-edges"><line x1="210" y1="44" x2="110" y2="110"/><line x1="210" y1="44" x2="300" y2="110"/><line x1="300" y1="134" x2="230" y2="186"/><line x1="300" y1="134" x2="370" y2="186"/></g>
<g class="tf-lbl"><text x="150" y="72">T</text><text x="262" y="72">F</text><text x="255" y="164">T</text><text x="343" y="164">F</text></g>
<g class="tf-node root"><rect x="165" y="20" width="90" height="28" rx="6"/><text x="210" y="39">X ≤ 1</text></g>
<g class="tf-node leaf"><rect x="65" y="110" width="90" height="28" rx="14"/><text x="110" y="129">Y = 1.5</text></g>
<g class="tf-node"><rect x="255" y="110" width="90" height="28" rx="6"/><text x="300" y="129">X ≤ 2</text></g>
<g class="tf-node leaf"><rect x="185" y="186" width="90" height="28" rx="14"/><text x="230" y="205">Y = 2.2</text></g>
<g class="tf-node leaf"><rect x="325" y="186" width="90" height="28" rx="14"/><text x="370" y="205">Y = 1.5</text></g>
</svg></div>
<table class="tbl compact"><tbody>
<tr><td><b>Root node</b></td><td>The first split, at the top (X ≤ 1). Sees all the data.</td></tr>
<tr><td><b>Splitting / internal node</b></td><td>Any node that tests a condition (X ≤ 1, X ≤ 2).</td></tr>
<tr><td><b>Leaf / terminal node</b></td><td>A node with no children; it holds the prediction.</td></tr>
<tr><td><b>Parent / child</b></td><td>A node and the nodes directly below it (X ≤ 2 is the parent of both lower leaves).</td></tr>
<tr><td><b>Branch / subtree</b></td><td>A node together with everything below it.</td></tr>
<tr><td><b>Depth</b></td><td>Number of splits on the longest root-to-leaf path (here 2).</td></tr>
<tr><td><b>Pruning</b></td><td>Removing a subtree and replacing it by a leaf (e.g. collapse X ≤ 2 into one leaf Y = 1.9).</td></tr>
</tbody></table>
<details class="quick"><summary>Quick check: leaves, depth, predictions</summary>
<p>3 leaves, depth 2. Predictions: X = 0.4 → 1.5; X = 1.5 → 2.2; X = 2.7 → 1.5. The parent of "Y = 2.2" is "X ≤ 2", which is an internal (splitting) node, not the root.</p></details>
`},
    { id: 'impurity', title: 'Impurity: Gini and entropy', html: String.raw`
<p>In a classification tree each leaf predicts the <b>majority class</b> of the training points in it (and the class proportions give a probability estimate). RSS measures distances between numbers, so it is meaningless for class labels. We need a measure of how <b>mixed</b> (impure) a node is.</p>
<p>The <b>misclassification error</b> \(E=1-\max_c p_c\) is intuitive but not sensitive enough to guide growth (see below). The two standard choices are smooth:</p>
<h4>Gini impurity</h4>
<div class="eq">\[G(Q)=\sum_{c\in C}p_c(1-p_c)=1-\sum_{c\in C}p_c^2,\qquad p_c=\frac{1}{|Q|}\sum_{x\in Q}\mathbb 1(y_x=c)\]</div>
<p>\(p_c\) is the share of class \(c\) in node \(Q\) (the indicator \(\mathbb 1\) counts the samples of class \(c\)). <b>Meaning</b>: the probability that a random element is misclassified if you label it randomly according to the node's class proportions. 0 for a pure node; maximum \(1-1/C\) when all \(C\) classes are equally mixed (0.5 for two classes).</p>
<h4>Entropy</h4>
<div class="eq">\[H(S)=-\sum_{i=1}^{C}p_i\log_2 p_i\]</div>
<p>Entropy measures disorder or uncertainty, in <b>bits</b>. 0 for a pure node, up to 1 bit for a 50/50 two-class node, \(\log_2 C\) for \(C\) equal classes. Example: 70% A / 30% B gives \(H=-0.7\log_20.7-0.3\log_20.3=0.881\) bits.</p>
<div class="viz" data-viz="impurity"></div>
<h4>Why not just use the error rate?</h4>
<p>Parent: 400 A / 400 B. Split 1 makes (300 A, 100 B) and (100 A, 300 B). Split 2 makes (200 A, 400 B) and (200 A, 0 B).</p>
<table class="tbl compact"><thead><tr><th>Weighted impurity of children</th><th>Split 1</th><th>Split 2</th></tr></thead><tbody>
<tr><td>Misclassification error</td><td>0.25</td><td>0.25</td></tr>
<tr><td>Gini</td><td>0.375</td><td><b>0.333</b></td></tr>
<tr><td>Entropy (bits)</td><td>0.811</td><td><b>0.689</b></td></tr></tbody></table>
<p>Split 2 creates a pure node, great for further growing, yet the error rate scores both splits the same. Gini and entropy are <b>strictly concave</b> (curved), so any move toward purer children lowers them; the error rate is piecewise linear and often cannot "see" a useful split. In practice Gini and entropy give very similar trees; Gini is slightly cheaper (no logarithm).</p>
<p class="small">Verify Split 2's Gini: left node \(1-(\tfrac13)^2-(\tfrac23)^2=\tfrac49\), weight \(\tfrac{600}{800}\): \(0.75\times0.444=0.333\); right node is pure (0).</p>
`},
    { id: 'gain', title: 'Information gain and the construction algorithm', html: String.raw`
<p>A split is good if its children are much purer than the parent. <b>Information gain</b> measures how much entropy the split removes:</p>
<div class="eq">\[\text{Gain}(S,A)=H(S)-\sum_{v\in\text{Values}(A)}\frac{|S_v|}{|S|}\,H(S_v)\]</div>
<p>\(S_v\) is the subset where feature \(A\) has value \(v\), and \(\frac{|S_v|}{|S|}\) is its share of the data. The second term is the <b>weighted average</b> entropy of the children. Higher gain = better split. With Gini the same idea is the <b>Gini decrease</b>: parent Gini minus weighted child Gini.</p>
<h4>Building the tree</h4>
<ol class="steps plain">
<li>Start with the whole labeled dataset at the root.</li>
<li>For every feature and every candidate threshold, compute the weighted impurity of the children (Gini) or the information gain (entropy).</li>
<li>Choose the split with the lowest weighted impurity / highest gain.</li>
<li>Repeat recursively (greedy, top-down) in each child.</li>
<li>Stop when a node is pure, when no split reduces impurity enough, or at a limit on depth / samples per node.</li>
</ol>
<p>Each leaf then predicts the majority class of its points. The impurity is re-evaluated for every candidate feature and threshold at every new split.</p>
<h4>Worked example: is this email spam?</h4>
<p>7 emails: 3 spam, 4 not. Compare two binary features. Pick a feature to see the full calculation.</p>
<div class="viz" data-viz="spamSplit"></div>
`},
    { id: 'beyondbin', title: 'Continuous and multi-category features', html: String.raw`
<h4>Continuous features: test the midpoints</h4>
<ol class="steps plain">
<li>Sort the rows by the feature.</li>
<li>Candidate thresholds are the averages between neighbouring values.</li>
<li>Compute the weighted Gini of each split "\(x\le t\)".</li>
<li>Keep the threshold with the lowest impurity.</li>
</ol>
<div class="viz" data-viz="thresh"></div>
<ul>
<li>A feature with \(n\) distinct values has \(n-1\) candidate thresholds.</li>
<li>Midpoints are enough: any threshold strictly between two neighbouring values produces <em>the same partition</em> of the training data, so only one per gap needs testing.</li>
<li><b>No feature scaling needed</b>: a tree only compares a feature to a threshold, and rescaling preserves the order of values.</li>
</ul>
<h4>Multi-category features: test groupings</h4>
<p>Sender ∈ {Abe, Bob, Claire}. A binary split sends some categories left and the rest right. A split and its mirror image put the same emails together, so with \(k\) categories there are only \(2^{k-1}-1\) distinct splits (\(k=3\to3\); \(k=10\to511\)).</p>
<table class="tbl compact"><thead><tr><th>Split</th><th>Left spam Y/N</th><th>Right spam Y/N</th><th>Weighted Gini</th></tr></thead><tbody>
<tr><td>{Abe} vs {Bob, Claire}</td><td>1/1</td><td>1/2</td><td>(2/5)(0.5)+(3/5)(0.444) = 0.467</td></tr>
<tr><td>{Bob} vs {Abe, Claire}</td><td>1/1</td><td>1/2</td><td>0.467</td></tr>
<tr><td><b>{Claire} vs {Abe, Bob}</b></td><td>0/1</td><td>2/2</td><td><b>(1/5)(0)+(4/5)(0.5) = 0.400</b></td></tr></tbody></table>
<p>Best: Claire vs {Abe, Bob}. In practice scikit-learn trees need numeric input, so categories are one-hot or ordinal encoded first.</p>
<h4>Choosing the root, and feature importance</h4>
<ul>
<li>The root is the feature/threshold with the lowest weighted impurity (highest gain) over all features.</li>
<li>Features never chosen are ignored: trees perform <b>implicit feature selection</b>.</li>
<li>Summing the impurity decrease each feature produces over all its splits gives its <b>feature importance</b> (<code>feature_importances_</code>).</li>
<li>Requiring a minimum impurity decrease stops the tree from using weak, noisy features.</li>
<li>Caution: impurity-based importance favours features with many distinct values. Check with <b>permutation importance</b>.</li>
</ul>
`},
    { id: 'overfit', title: 'Overfitting and pruning', html: String.raw`
<p>Keep splitting and every leaf eventually becomes pure: training accuracy climbs to 100%. Test accuracy peaks and then <em>drops</em>, because the extra splits fit noise. A fully grown tree has <b>low bias and high variance</b>. Build a tree yourself below; the accuracy-vs-depth chart is computed live.</p>
<div class="viz" data-viz="treeLab"></div>
<h4>Pre-pruning (early stopping)</h4>
<ul>
<li><code>min_impurity_decrease</code>: only split if impurity drops by at least this much.</li>
<li><code>max_depth</code>: cap the depth. Similar limits: <code>min_samples_leaf</code>, <code>max_leaf_nodes</code>.</li>
</ul>
<p>Simple, but short-sighted: a weak split may enable a very good split below it.</p>
<h4>Post-pruning: cost-complexity (weakest-link) pruning</h4>
<p>Grow a large tree first, then cut back branches that don't "pay for themselves". Keep the subtree \(T\) that minimises</p>
<div class="eq">\[R_\alpha(T)=R(T)+\alpha\,|T|\]</div>
<p>\(R(T)\): total impurity or error of the leaves. \(|T|\): number of leaves. \(\alpha\ge0\): the price paid per leaf. \(\alpha=0\) keeps the full tree; increasing \(\alpha\) gives smaller and smaller subtrees. Choose \(\alpha\) by cross-validation (<code>ccp_alpha</code>). Notice the shape: fit + λ·complexity, the same idea as Ridge and Lasso.</p>
<div class="note trap"><b>Never tune on the test set</b>Choose depth, leaf size or α with a validation set or cross-validation. The test set is touched once, to report the final expected accuracy.</div>
<pre class="code"><code>from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import GridSearchCV

tree = DecisionTreeClassifier(criterion="gini", random_state=0)  # or "entropy"
params = {"max_depth": [2, 3, 4, 5, 6, None],
          "min_samples_leaf": [1, 5, 10],
          "ccp_alpha": [0.0, 0.001, 0.01]}
search = GridSearchCV(tree, params, cv=5).fit(X_train, y_train)
best = search.best_estimator_
print(search.best_params_, best.score(X_test, y_test))
plot_tree(best, filled=True)          # visualise the learned rules</code></pre>
`},
    { id: 'vslinear', title: 'Trees vs linear models', html: String.raw`
<p>Which is better depends on the true relationship:</p>
<ul>
<li><b>Close to linear</b> → a linear model wins. A tree needs many "steps" to imitate a slanted line.</li>
<li><b>Non-linear, axis-aligned, with interactions</b> → a tree wins.</li>
</ul>
<p>Also weigh interpretability, and compare both with cross-validation.</p>
<table class="tbl">
<thead><tr><th>Advantages</th><th>Limitations</th></tr></thead>
<tbody>
<tr><td>Easy to explain and visualise ("white-box" if-then rules)</td><td>Overfit easily without depth limits or pruning</td></tr>
<tr><td>Little data preparation; no feature scaling</td><td>Unstable: a small data change can give a very different tree (high variance)</td></tr>
<tr><td>Handle numeric and categorical features, multi-class and regression</td><td>Piecewise-constant: jagged boundaries for diagonal patterns, poor extrapolation</td></tr>
<tr><td>Capture non-linear effects and interactions automatically</td><td>Greedy: the globally optimal tree is NP-hard to find</td></tr>
<tr><td>Fast predictions (≈ log n for balanced trees)</td><td>Usually less accurate than ensembles → Random Forests &amp; Boosting</td></tr>
</tbody></table>
`}
  ],
  examples: [
    { title: 'Gini by hand', html: String.raw`
<p>Node with 6 red, 2 blue: \(G=1-(0.75^2+0.25^2)=1-0.625=\mathbf{0.375}\).</p>
<p>(5, 5): \(G=0.5\). (9, 1): \(G=1-(0.81+0.01)=0.18\), so (9, 1) is purer.</p>
<p>Three classes, equally mixed: \(1-3(1/3)^2=0.667=1-1/C\).</p>`},
    { title: 'Spam by URL: Gini and information gain', html: String.raw`
<p>URL = T: 2 spam, 1 not. URL = F: 1 spam, 3 not.</p>
<p>Gini(T) = \((\tfrac23)(\tfrac13)+(\tfrac13)(\tfrac23)=0.444\). Gini(F) = \((\tfrac14)(\tfrac34)+(\tfrac34)(\tfrac14)=0.375\). Weighted: \(\tfrac37(0.444)+\tfrac47(0.375)=\mathbf{0.405}\). Root Gini \(=1-(\tfrac37)^2-(\tfrac47)^2=0.490\), decrease 0.085.</p>
<p>Entropy(root) = 0.985; Entropy(T) = 0.918; Entropy(F) = 0.811; weighted 0.857; <b>Gain = 0.128 bits</b>.</p>`},
    { title: 'Choosing the root: URL vs attachment', html: String.raw`
<p>Has attachment = T: 3 spam, 1 not (Gini 0.375, entropy 0.811). F: 0 spam, 3 not (pure).</p>
<p>Weighted Gini = \(\tfrac47(0.375)+\tfrac37(0)=\mathbf{0.214}\) &lt; 0.405 → attachment is the better root.</p>
<p>Gain = 0.985 − \(\tfrac47\)(0.811) = <b>0.522 bits</b> &gt; 0.128. Information gain agrees.</p>`},
    { title: 'Continuous threshold search', html: String.raw`
<p>Words: 10 Y, 20 Y, 30 N, 40 N, 50 N. Midpoints 15, 25, 35, 45.</p>
<table class="tbl compact"><thead><tr><th>Split</th><th>Left</th><th>Right</th><th>Weighted Gini</th></tr></thead><tbody>
<tr><td>≤ 15</td><td>1Y</td><td>1Y 3N (0.375)</td><td>(4/5)(0.375) = 0.30</td></tr>
<tr><td><b>≤ 25</b></td><td>2Y</td><td>3N</td><td><b>0</b></td></tr>
<tr><td>≤ 35</td><td>2Y 1N (0.444)</td><td>2N</td><td>(3/5)(0.444) = 0.267</td></tr>
<tr><td>≤ 45</td><td>2Y 2N (0.5)</td><td>1N</td><td>(4/5)(0.5) = 0.40</td></tr></tbody></table>
<p>Choose Words ≤ 25: both children pure.</p>`},
    { title: 'Entropy of a 70/30 node', html: String.raw`
<p>\(H=-0.7\log_2 0.7-0.3\log_2 0.3=0.7(0.515)+0.3(1.737)=0.360+0.521=\mathbf{0.881}\) bits. Compare Gini: \(1-0.49-0.09=0.42\).</p>`},
    { title: 'Cost-complexity pruning decision', html: String.raw`
<p>Subtree A has 5 leaves and total error 0.10; its pruned version B has 2 leaves and error 0.16.</p>
<p>With \(\alpha=0.01\): \(R_\alpha(A)=0.10+0.05=0.15\), \(R_\alpha(B)=0.16+0.02=0.18\) → keep A.</p>
<p>With \(\alpha=0.03\): \(R_\alpha(A)=0.10+0.15=0.25\), \(R_\alpha(B)=0.16+0.06=0.22\) → prune to B. Break-even at \(\alpha=0.06/3=0.02\).</p>`}
  ],
  summary: {
    big: 'A decision tree recursively splits the feature space into rectangles with if-then rules. Each split is chosen greedily, top-down, to minimise impurity: RSS for regression, Gini (1 − Σp²) or entropy (−Σp log₂p) for classification, or equivalently to maximise information gain. Leaves predict the mean or majority class. Fully grown trees have low bias and high variance, so they are controlled by pre-pruning (max_depth, min_samples_leaf, min_impurity_decrease) or cost-complexity post-pruning R(T) + α|T|, tuned by cross-validation.',
    concepts: [
      'Decision analysis trees are drawn by people; decision tree learning learns splits from data using an information metric.',
      'History: AID 1963, CART 1984 (Gini, pruning), ID3 1986 (entropy), C4.5 1993, Random Forests 2001, XGBoost 2016.',
      'Regression tree: leaves predict the region mean; split minimises RSS; recursive binary splitting; greedy; global optimum is NP-hard.',
      'Anatomy: root, internal/splitting nodes, leaves, parent/child, branches/subtrees, depth, pruning.',
      'Classification leaf predicts the majority class; class proportions give probabilities.',
      'Gini = 1 − Σp_c², max 1 − 1/C; entropy = −Σp log₂ p, max log₂C bits.',
      'Error rate is not sensitive enough; Gini and entropy are strictly concave and reward purer children.',
      'Information gain = parent entropy − weighted child entropy; Gini decrease is the analogue.',
      'Continuous features: sort and test the n − 1 midpoints; no scaling needed.',
      'k categories → 2^{k−1} − 1 distinct binary splits.',
      'Implicit feature selection; impurity importance is biased toward high-cardinality features (use permutation importance).',
      'Deep trees overfit: train accuracy → 100%, test accuracy peaks then falls.',
      'Cost-complexity: minimise R(T) + α|T|; α by CV (ccp_alpha).'
    ],
    terms: [
      ['Decision tree learning', 'Learning if-then split rules from data using an impurity / information metric.'],
      ['Root node', 'The first split; sees all the training data.'],
      ['Internal (splitting) node', 'A node that tests a condition and has children.'],
      ['Leaf (terminal) node', 'A node with no children that outputs a prediction.'],
      ['Depth', 'Number of splits on the longest root-to-leaf path.'],
      ['Recursive binary splitting', 'Greedy top-down procedure that repeatedly splits regions in two.'],
      ['Greedy algorithm', 'Takes the locally best choice at each step without lookahead.'],
      ['Gini impurity', '1 − Σp_c²: chance a random element is mislabeled when labeled by class proportions.'],
      ['Entropy', '−Σp log₂ p: disorder/uncertainty of a node in bits.'],
      ['Information gain', 'Entropy of parent minus weighted entropy of children.'],
      ['Misclassification error', '1 − share of the majority class; too insensitive for growing trees.'],
      ['Pre-pruning', 'Stopping growth early with limits (max_depth, min_samples_leaf, min_impurity_decrease).'],
      ['Post-pruning', 'Growing a large tree and then removing weak branches.'],
      ['Cost-complexity pruning', 'Choose subtree minimising R(T) + α|T|.'],
      ['Feature importance (MDI)', 'Total impurity decrease contributed by a feature over all splits.'],
      ['Permutation importance', 'Drop in score when one feature\'s values are shuffled.']
    ],
    formulas: [
      ['Regression split RSS', String.raw`\sum_{x_i\in R_1}(y_i-\bar y_{R_1})^2+\sum_{x_i\in R_2}(y_i-\bar y_{R_2})^2`],
      ['Gini', String.raw`G=\sum_c p_c(1-p_c)=1-\sum_c p_c^2,\quad G_{\max}=1-\tfrac1C`],
      ['Entropy', String.raw`H(S)=-\sum_i p_i\log_2 p_i,\quad H_{\max}=\log_2 C`],
      ['Weighted child impurity', String.raw`\frac{n_L}{n}I(L)+\frac{n_R}{n}I(R)`],
      ['Information gain', String.raw`\text{Gain}(S,A)=H(S)-\sum_{v}\frac{|S_v|}{|S|}H(S_v)`],
      ['Misclassification error', String.raw`E=1-\max_c p_c`],
      ['Distinct categorical splits', String.raw`2^{k-1}-1`],
      ['Cost-complexity', String.raw`R_\alpha(T)=R(T)+\alpha|T|`]
    ],
    traps: [
      'Always weight child impurities by their share of samples.',
      'Lower Gini/entropy is better; higher information gain is better.',
      'Error rate can tie two splits that Gini/entropy distinguish.',
      'n distinct values give n − 1 thresholds, not n.',
      'A split and its mirror image are the same split.',
      'Trees need no feature scaling.',
      'Tune depth/α with CV, never with the test set.',
      'Greedy splitting does not guarantee the optimal tree.'
    ],
    recall: [
      ['Gini of a node with 6 red and 2 blue?', '1 − (0.75² + 0.25²) = 0.375.'],
      ['Max Gini and max entropy for C classes?', 'Gini 1 − 1/C; entropy log₂C bits.'],
      ['Define information gain.', 'H(parent) − Σ (|S_v|/|S|) H(S_v).'],
      ['How are thresholds chosen for a continuous feature?', 'Sort the values, test the midpoints between neighbours, keep lowest weighted impurity.'],
      ['How many distinct binary splits for 4 categories?', '2³ − 1 = 7.'],
      ['Why does a deep tree overfit?', 'It keeps splitting until leaves are pure, fitting noise: low bias, high variance.'],
      ['Write the cost-complexity criterion.', 'R(T) + α|T|; α = 0 full tree, larger α smaller tree; choose α by CV.'],
      ['Why not use classification error to grow trees?', 'It is piecewise linear and often scores useful splits the same; Gini/entropy are strictly concave.']
    ]
  },
  quiz: [
    { q: 'A node has 9 red and 1 blue. Its Gini impurity is…', o: ['0.1', '0.18', '0.5', '0.9'], a: 1, e: '1 − (0.81 + 0.01) = 0.18.' },
    { q: 'The maximum entropy of a node with 4 equally likely classes is…', o: ['1 bit', '2 bits', '0.75', '4 bits'], a: 1, e: 'log₂ 4 = 2 bits.' },
    { q: 'Information gain is computed as…', o: ['Weighted child entropy − parent entropy', 'Parent entropy − weighted child entropy', 'Parent Gini × child Gini', 'Number of leaves × α'], a: 1, e: 'Gain = how much uncertainty the split removes.' },
    { q: 'A continuous feature has 8 distinct values. How many candidate thresholds must be tested?', o: ['8', '7', '16', '2⁸'], a: 1, e: 'One midpoint per gap between neighbouring sorted values.' },
    { q: 'A categorical feature has 4 categories. How many distinct binary splits exist?', o: ['4', '6', '7', '16'], a: 2, e: '2^(k−1) − 1 = 2³ − 1 = 7.' },
    { q: 'Do decision trees require feature scaling?', o: ['Yes, always standardise', 'No: splits compare a feature to a threshold, and scaling keeps the order', 'Only for entropy', 'Only for regression trees'], a: 1, e: 'Monotonic rescaling gives the same partitions.' },
    { q: 'Each leaf of a regression tree predicts…', o: ['The median of all y', 'The mean of the training responses in that leaf', 'A linear model', 'The majority class'], a: 1, e: 'The mean minimises RSS within the region.' },
    { q: 'As max_depth grows without limit, the tree\'s…', o: ['Bias rises and variance falls', 'Bias falls and variance rises', 'Both fall', 'Both rise'], a: 1, e: 'A fully grown tree memorises the training data.' },
    { q: 'In cost-complexity pruning R(T) + α|T|, increasing α…', o: ['Grows a larger tree', 'Produces smaller subtrees', 'Has no effect', 'Changes the impurity measure'], a: 1, e: 'Each leaf costs α, so more leaves become too expensive.' },
    { q: 'Why is the tree-growing procedure called greedy?', o: ['It uses all features', 'It picks the best split at each step without looking ahead', 'It always finds the optimal tree', 'It uses gradient descent'], a: 1, e: 'Finding the globally optimal tree is NP-hard.' },
    { q: 'URL split: left (2 spam, 1 not), right (1 spam, 3 not). Weighted Gini?', o: ['0.444', '0.375', '0.405', '0.490'], a: 2, e: '(3/7)(0.444) + (4/7)(0.375) = 0.405.' }
  ]
});

/* ------------------------------------------------------------------ L5 */
LECTURES.push({
  id: 'l5', code: 'L5', short: 'Random Forests', title: 'Ensemble Learning: Random Forests',
  thesis: 'One deep tree is unstable. Grow hundreds on bootstrapped rows with random feature subsets, and their errors cancel when you vote.',
  learn: [
    { id: 'ensemble', title: 'Ensemble learning: the wisdom of crowds', html: String.raw`
<p><b>Ensemble learning</b> trains several models and combines their predictions so the combined model is more accurate than any individual one. It mirrors what we do before a big decision: ask several people for their opinion.</p>
<p>The "wisdom of the crowd" only works under two conditions:</p>
<ol class="steps plain">
<li>Each model is <b>better than random guessing</b>.</li>
<li>The models make <b>different (ideally independent) mistakes</b>.</li>
</ol>
<h4>The quick calculation</h4>
<p>25 independent classifiers, each wrong 35% of the time. A majority vote is wrong only if 13 or more are wrong <em>at the same time</em>. That is a binomial tail:</p>
<div class="eq">\[P(\text{ensemble wrong})=\sum_{k=13}^{25}\binom{25}{k}\varepsilon^{k}(1-\varepsilon)^{25-k}\approx0.06\quad(\varepsilon=0.35)\]</div>
<p>From 35% error to 6%. But if each model is wrong 55% of the time (worse than a coin), adding models makes the majority <em>more</em> reliably wrong. Drag the sliders.</p>
<div class="viz" data-viz="crowd"></div>
`},
    { id: 'families', title: 'Two main families: bagging and boosting', html: String.raw`
<table class="tbl">
<thead><tr><th></th><th>Bagging (incl. Random Forests)</th><th>Boosting</th></tr></thead>
<tbody>
<tr><th>Training</th><td>In parallel, independently</td><td>Sequentially; each model focuses on the previous models' mistakes</td></tr>
<tr><th>Data per model</th><td>A bootstrap sample of the rows</td><td>Re-weighted data or residuals</td></tr>
<tr><th>Typical base trees</th><td>Deep trees (low bias, high variance)</td><td>Shallow trees, e.g. stumps (weak learners)</td></tr>
<tr><th>Main effect</th><td><b>Reduces variance</b></td><td><b>Mainly reduces bias</b></td></tr>
<tr><th>Examples</th><td>Bagged trees, Random Forest</td><td>AdaBoost, Gradient Boosting, XGBoost (next lecture)</td></tr>
</tbody></table>
<p class="small">A third family, <b>stacking</b>, trains a meta-model that learns how to combine different types of models.</p>
`},
    { id: 'whynot', title: 'Why one tree is not enough', html: String.raw`
<p>Even with tuned rules (criterion, min impurity decrease, depth limits, leaf limits), a single tree is limited:</p>
<ul>
<li>For every set of rules there is <b>only one tree</b>: the root feature is always the same and has a huge influence over the whole tree.</li>
<li>Greedy splitting may never use some useful features.</li>
<li>The real problem is <b>high variance</b>: a deep tree fits the training data closely (low bias), but change the sample a little and you get a very different tree.</li>
</ul>
<p>Averaging many such trees cancels much of that variance. Ho (1995) showed that a forest built on random feature subspaces keeps improving on unseen data as trees are added, even though each tree is grown deep.</p>
`},
    { id: 'rf', title: 'How a random forest is built', html: String.raw`
<p>A random forest is an ensemble designed specifically for trees, with <b>two sources of randomness</b>:</p>
<ol class="steps">
<li><span><b>Bootstrapped rows, once per tree.</b> Each tree trains on its own bootstrap sample: the same size as the data, drawn with replacement. This is <b>Bagging</b> (<b>B</b>ootstrap <b>AGG</b>regat<b>ING</b>, Breiman 1996).</span></li>
<li><span><b>Random feature subset, at every split.</b> When a node looks for its best split, it may only choose among a random subset of \(m\) features instead of all \(N\). A new subset is drawn at the next node. Ho's <b>random subspace</b> idea (1995), added to bagging by Breiman (2001).</span></li>
<li><span><b>Grow each tree deep</b>, splitting until a node can no longer decrease Gini enough or a stopping rule is hit.</span></li>
<li><span><b>Aggregate</b>: majority vote for classification, average for regression.</span></li>
</ol>
<div class="note intuition"><b>What the feature subsets really do</b>They do not stop a single tree from overfitting. They make the trees <b>different from each other</b> (decorrelated). A dominant feature can no longer sit at the root of every tree, so other features get explored, and the trees' errors partly cancel when averaged.</div>
<h4>Combining predictions</h4>
<div class="trio">
<div><b>Classification</b><span>Trees say (0, 0, 1). Majority vote → class 0. Probability of class 0 = 2/3.</span></div>
<div><b>Soft voting</b><span>Scikit-learn averages the trees' class <em>probabilities</em> instead of counting votes.</span></div>
<div><b>Regression</b><span>Trees say (10, 13, 11). Average → 11.33.</span></div>
</div>
<p>Build a forest below. Compare one tree's jagged boundary with the forest's smoothed probabilities as you add trees.</p>
<div class="viz" data-viz="forest"></div>
`},
    { id: 'variance', title: 'Why averaging reduces variance (and when it stops)', html: String.raw`
<p>Average \(B\) trees whose predictions each have variance \(\sigma^2\). If they were <b>independent</b>, the average would have variance \(\sigma^2/B\), shrinking forever. But trees trained on the same data are <b>correlated</b> (pairwise correlation \(\rho\)), and then</p>
<div class="eq">\[\text{Var}\Big(\frac1B\sum_{b=1}^{B}T_b\Big)=\rho\sigma^2+\frac{1-\rho}{B}\sigma^2\]</div>
<ul>
<li>As \(B\) grows, the second term → 0. More trees always help, but with diminishing returns.</li>
<li>What remains, \(\rho\sigma^2\), comes from the <b>correlation</b> between trees. New trees mostly repeat what earlier trees learned.</li>
<li>So to go further we must lower \(\rho\): that is precisely the job of the random feature subsets. This is why random forests beat plain bagging.</li>
</ul>
<div class="viz" data-viz="varAvg"></div>
`},
    { id: 'hyper', title: 'Hyperparameters', html: String.raw`
<p>A forest shares most hyperparameters with a single tree. The ones unique to it:</p>
<h4>Number of estimators (<code>n_estimators</code>)</h4>
<ul>
<li>More trees = more feature-subset combinations and a more stable average.</li>
<li>Breiman: "Random forests does not overfit. You can run as many trees as you want." Read carefully: <b>adding trees</b> does not cause overfitting (the error converges). The forest can still overfit noisy data if each tree is very deep; that is controlled by <code>max_depth</code> / <code>min_samples_leaf</code>.</li>
<li>Default 100. Oshiro et al. (2012) found little gain beyond 64-128 trees. More trees never hurt accuracy; they cost time and memory.</li>
<li>Instead of a big grid search, plot OOB (or validation) error vs number of trees and stop where the curve flattens (like the elbow method in KNN).</li>
</ul>
<h4>Features per split (<code>max_features</code>)</h4>
<ul>
<li>Classification: \(\sqrt N\) (e.g. N = 25 → 5). Regression: Breiman suggested \(N/3\). (Scikit-learn's regressor default is 1.0 = all features, i.e. plain bagged trees.) Breiman's original paper also tried 1 and \(\lfloor\log_2N+1\rfloor\).</li>
<li>The trade-off: <b>fewer features → less correlated trees</b> (good) but <b>each tree is weaker</b> (higher bias).</li>
<li>Treat it as a tuning parameter; \(\sqrt N\) is a good start, tune with CV or OOB error.</li>
</ul>
<h4>Tree size</h4>
<p>Fully grown trees (<code>max_depth=None</code>, <code>min_samples_leaf=1</code>) are a good start; limit them if the data is very noisy.</p>
<p class="small">Note: <code>max_features='auto'</code> was removed in scikit-learn 1.3; defaults are now <code>'sqrt'</code> (classifier) and <code>1.0</code> (regressor).</p>
`},
    { id: 'boot', title: 'Bootstrapping and out-of-bag error', html: String.raw`
<p><b>Bootstrapping</b> means random sampling <b>with replacement</b>. Draw 10 letters from {A, B, C, D, E}, putting each back after drawing: you might get C A D C E D A B B C. Duplicates are allowed, and some items may never appear.</p>
<div class="viz" data-viz="bootstrap"></div>
<h4>How many rows are left out?</h4>
<p>Each draw picks a given row with probability \(\frac1n\). Over \(n\) independent draws, the chance a row is <b>never</b> picked is</p>
<div class="eq">\[\Big(1-\frac1n\Big)^{n}\;\xrightarrow{\,n\to\infty\,}\;e^{-1}\approx0.368\]</div>
<table class="tbl compact"><thead><tr><th>n</th><td>5</td><td>10</td><td>100</td><td>1,000</td></tr></thead><tbody><tr><th>\((1-1/n)^n\)</th><td>0.328</td><td>0.349</td><td>0.366</td><td>0.368</td></tr></tbody></table>
<p>So each tree sees about <b>63.2%</b> of the unique rows and leaves about <b>36.8%</b> (roughly a third) <b>out-of-bag (OOB)</b>.</p>
<h4>The OOB error</h4>
<ol class="steps plain">
<li>For each training row, find the trees that did <em>not</em> see it (about a third of them).</li>
<li>Let only those trees vote on that row.</li>
<li>Compare the OOB prediction \(\hat y\) with the true \(y\). Average the errors over all rows.</li>
</ol>
<ul>
<li>It is a "free" validation estimate: no separate split needed, because bootstrapping naturally leaves rows unused. In practice it is very close to cross-validation error.</li>
<li>It does <b>not</b> affect training; it only measures performance.</li>
<li>It needs <code>bootstrap=True</code>. It is off by default (<code>oob_score=False</code>) because it costs extra computation.</li>
<li>With <code>bootstrap=False</code> every tree sees every row and the only randomness is the feature subsets. Bootstrapping is a second way to decorrelate trees: different rows per tree, different candidate features per split.</li>
</ul>
`},
    { id: 'practice', title: 'Feature importance, code, strengths and limitations', html: String.raw`
<h4>Which features matter?</h4>
<ul>
<li><b>Impurity-based (MDI)</b>: total Gini decrease from all splits on a feature, averaged over trees (<code>feature_importances_</code>).</li>
<li><b>Permutation importance</b>: shuffle one feature in the test data and measure how much accuracy drops.</li>
</ul>
<p>Example from the slides: predicting "passes the course", MDI ranks a random <b>student ID</b> as the most important feature because it has many unique values to split on. Permutation importance correctly gives it ≈ 0. Prefer permutation importance.</p>
<pre class="code"><code>from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

rf = RandomForestClassifier(
    n_estimators=300,      # number of trees
    max_features="sqrt",   # features tried at each split
    bootstrap=True,        # bootstrap rows for each tree
    oob_score=True,        # free validation estimate
    n_jobs=-1,             # train trees in parallel
    random_state=42)
rf.fit(X_train, y_train)
print("OOB accuracy :", rf.oob_score_)
print("Test accuracy:", rf.score(X_test, y_test))
imp = permutation_importance(rf, X_test, y_test, n_repeats=10)</code></pre>
<p class="small">No feature scaling needed. For regression use <code>RandomForestRegressor</code> (consider <code>max_features</code> ≈ 1/3).</p>
<table class="tbl">
<thead><tr><th>Strengths</th><th>Limitations</th></tr></thead>
<tbody>
<tr><td>Strong accuracy out of the box; few hyperparameters</td><td>Much harder to interpret than one tree</td></tr>
<tr><td>Adding trees does not cause overfitting</td><td>Large models: more memory, slower predictions</td></tr>
<tr><td>No scaling; handles many features</td><td>Regression cannot predict outside the range of training targets</td></tr>
<tr><td>Built-in validation (OOB) and feature importance</td><td>MDI importance biased toward high-cardinality features</td></tr>
<tr><td>Trees train in parallel</td><td>Boosted trees often more accurate on tabular data</td></tr>
</tbody></table>
<div class="note intuition"><b>Next: boosting</b>Random forest: many deep trees in parallel; averaging removes variance. Boosting: many small trees one after another, each correcting the mistakes of those before it, which attacks bias.</div>
`}
  ],
  examples: [
    { title: 'Majority vote error of an ensemble', html: String.raw`
<p>3 independent classifiers, each with error 0.2. The majority is wrong if ≥ 2 are wrong:</p>
<p>\(\binom32(0.2)^2(0.8)+\binom33(0.2)^3=3(0.04)(0.8)+0.008=0.096+0.008=\mathbf{0.104}\). Better than 0.2.</p>
<p>With error 0.6: \(3(0.36)(0.4)+0.216=0.648\). Worse than 0.6: weak-but-worse-than-random models make the crowd worse.</p>`},
    { title: 'Voting and averaging', html: String.raw`
<p>Five trees classify a patient as (1, 0, 1, 1, 0): majority 1, \(P(1)=3/5=0.6\).</p>
<p>Soft voting with tree probabilities of class 1 = (0.9, 0.4, 0.6, 0.55, 0.3): mean = 0.55 → class 1.</p>
<p>Regression trees predict (210, 190, 205): average 201.67.</p>`},
    { title: 'Bootstrap and OOB by hand', html: String.raw`
<p>Rows 0-6 (n = 7). A tree's bootstrap sample: 2, 5, 3, 5, 1, 2, 3. Unique rows used: {1, 2, 3, 5}. OOB rows: <b>{0, 4, 6}</b>, which this tree can be tested on.</p>
<p>Expected OOB fraction for n = 7: \((6/7)^7\approx0.340\).</p>`},
    { title: 'Correlation limits averaging', html: String.raw`
<p>\(\sigma^2=1\), \(\rho=0.3\). One tree: Var = 1. 10 trees: \(0.3+0.7/10=0.37\). 100 trees: \(0.3+0.007=0.307\). 1000 trees: 0.3007. The floor is \(\rho\sigma^2=0.3\). Lower \(\rho\) to 0.1 (fewer features per split) and 100 trees give 0.109.</p>`},
    { title: 'Choosing max_features', html: String.raw`
<p>N = 64 features. Classification: \(\sqrt{64}=8\) per split. Regression (Breiman): 64/3 ≈ 21. Breiman's other suggestion \(\lfloor\log_2 64+1\rfloor=7\). Setting max_features = 64 (all) gives plain bagging.</p>`}
  ],
  summary: {
    big: 'Ensembles combine models that are better than chance and make different mistakes. A random forest is bagging (each tree on a bootstrap sample of rows) plus a random subset of m features at every split, aggregated by majority/soft vote or averaging. Averaging cuts variance as ρσ² + (1−ρ)σ²/B; feature subsets lower the correlation ρ. More trees never overfit but plateau; max_features ≈ √N (classification) or N/3 (regression). About 36.8% of rows are out-of-bag per tree, giving a free OOB error estimate. Prefer permutation importance to MDI.',
    concepts: [
      'Ensemble = train several models and combine; works only if each beats random and errors differ.',
      '25 classifiers at 35% error → majority error ≈ 6%; at 55% error the ensemble gets worse.',
      'Bagging: parallel, bootstrap rows, deep trees, reduces variance. Boosting: sequential, re-weighted data, shallow trees, reduces bias. Stacking: meta-model.',
      'A single deep tree has high variance; same root every time.',
      'Random forest = bootstrap rows (per tree) + random feature subset (per split).',
      'Aggregation: majority vote / soft vote (sklearn) for classification; average for regression.',
      'Var(average) = ρσ² + (1 − ρ)σ²/B; more trees shrink the second term; feature subsets shrink ρ.',
      'n_estimators: more is safe, plateaus (~100-150); plot OOB error vs trees.',
      'max_features: √N classification, N/3 regression; fewer → less correlation but weaker trees.',
      'Bootstrap: sample with replacement; each tree sees ≈ 63.2% unique rows; (1 − 1/n)ⁿ → 0.368 OOB.',
      'OOB error: predict each row with only trees that didn\'t see it; ≈ CV error; needs bootstrap=True.',
      'MDI importance is biased toward high-cardinality features; use permutation importance.'
    ],
    terms: [
      ['Ensemble learning', 'Combining several models so the combination is more accurate than each one.'],
      ['Wisdom of the crowd', 'Majority of independent, better-than-random voters is more accurate than individuals.'],
      ['Bagging', 'Bootstrap AGGregatING: train models on bootstrap samples and aggregate.'],
      ['Boosting', 'Sequential ensemble where each model focuses on previous mistakes; reduces bias.'],
      ['Stacking', 'A meta-model learns how to combine different base models.'],
      ['Random forest', 'Bagged decision trees with a random feature subset at every split.'],
      ['Random subspace method', 'Ho (1995): grow each tree using a random subset of features.'],
      ['Bootstrap sample', 'Sample of size n drawn with replacement from n rows.'],
      ['Out-of-bag (OOB) sample', 'Rows not drawn in a tree\'s bootstrap sample (~36.8%).'],
      ['OOB error', 'Error from predicting each row using only trees for which it was out-of-bag.'],
      ['n_estimators', 'Number of trees in the forest.'],
      ['max_features', 'Number of features considered at each split.'],
      ['Soft voting', 'Averaging predicted class probabilities instead of counting votes.'],
      ['Decorrelation', 'Making trees differ so their errors cancel when averaged.'],
      ['MDI importance', 'Mean decrease in impurity from splits on a feature.'],
      ['Permutation importance', 'Score drop when a feature is randomly shuffled.']
    ],
    formulas: [
      ['Majority-vote error', String.raw`\sum_{k=\lceil (n+1)/2\rceil}^{n}\binom{n}{k}\varepsilon^k(1-\varepsilon)^{n-k}`],
      ['Variance of an average', String.raw`\text{Var}\Big(\tfrac1B\sum_b T_b\Big)=\rho\sigma^2+\frac{1-\rho}{B}\sigma^2`],
      ['OOB probability', String.raw`\Big(1-\frac1n\Big)^n\to e^{-1}\approx0.368`],
      ['Features per split', String.raw`m\approx\sqrt N\ (\text{classif.}),\quad m\approx N/3\ (\text{regr.})`],
      ['Regression forest', String.raw`\hat y=\frac1B\sum_{b=1}^{B}T_b(x)`]
    ],
    traps: [
      'Adding more trees does not overfit; very deep trees on noisy data can.',
      'Random feature subsets decorrelate trees; they do not stop one tree from overfitting.',
      'Feature subsets are redrawn at every split, bootstrap rows once per tree.',
      'OOB requires bootstrap=True and does not influence training.',
      'Each row is scored by about a third of the trees, not the whole forest.',
      'Bagging reduces variance; boosting mainly reduces bias.',
      'Random-forest regression cannot extrapolate beyond the training target range.',
      'Ensembles of worse-than-random models get worse as they grow.'
    ],
    recall: [
      ['Two conditions for an ensemble to help?', 'Each model better than random; models make different (ideally independent) mistakes.'],
      ['What are the two sources of randomness in a random forest?', 'Bootstrap sample of rows per tree; random subset of features at every split.'],
      ['Write the variance of an average of B correlated trees.', 'ρσ² + (1 − ρ)σ²/B.'],
      ['Why does the error curve flatten as trees are added?', 'The (1 − ρ)σ²/B term vanishes; ρσ² from correlation remains.'],
      ['What fraction of rows is out-of-bag per tree, and why?', '(1 − 1/n)ⁿ → e^{−1} ≈ 36.8%.'],
      ['Default max_features for classification and regression?', '√N for classification; N/3 (Breiman) or 1.0 in sklearn for regression.'],
      ['Bagging vs boosting in one line each?', 'Bagging: parallel deep trees, cuts variance. Boosting: sequential weak learners, cuts bias.'],
      ['Why is permutation importance preferred over MDI?', 'MDI favours high-cardinality features (e.g. IDs); permutation measures actual score drop.']
    ]
  },
  quiz: [
    { q: 'An ensemble of 25 independent classifiers, each 35% wrong, has majority-vote error of about…', o: ['35%', '6%', '0.35²⁵', '50%'], a: 1, e: 'The binomial tail P(≥13 wrong) ≈ 0.06.' },
    { q: 'If each base classifier is wrong 55% of the time, adding more of them…', o: ['Improves the majority vote', 'Makes the majority vote worse', 'Has no effect', 'Makes error exactly 50%'], a: 1, e: 'They must beat random guessing for the crowd to help.' },
    { q: 'Bagging mainly reduces…', o: ['Bias', 'Variance', 'Irreducible error', 'Training time'], a: 1, e: 'Averaging many high-variance deep trees cancels variance.' },
    { q: 'In a random forest, the random feature subset is drawn…', o: ['Once per forest', 'Once per tree', 'At every split', 'Only at the root'], a: 2, e: 'Bootstrap rows are per tree; feature subsets are redrawn at each node.' },
    { q: 'Approximately what fraction of unique rows does each bootstrap sample contain?', o: ['36.8%', '50%', '63.2%', '100%'], a: 2, e: '1 − e^{−1} ≈ 0.632; the other 36.8% are out-of-bag.' },
    { q: 'Var of the average of B trees is ρσ² + (1−ρ)σ²/B. As B → ∞ it approaches…', o: ['0', 'σ²', 'ρσ²', 'σ²/B'], a: 2, e: 'The correlation term remains; lower ρ to go further.' },
    { q: 'Common default max_features for a random forest classifier with N = 49 features?', o: ['49', '16', '7', '1'], a: 2, e: '√49 = 7.' },
    { q: 'Which statement about n_estimators is correct?', o: ['Too many trees causes overfitting', 'More trees never hurts accuracy but costs time; error plateaus', 'Always use exactly 10', 'It controls tree depth'], a: 1, e: 'Breiman: random forests do not overfit from adding trees.' },
    { q: 'OOB error is computed by predicting each row using…', o: ['All trees', 'Only trees that did not see that row in training', 'Only the first tree', 'A separate test set'], a: 1, e: 'About a third of the trees for each row.' },
    { q: 'MDI feature importance ranks a random student ID as most important. Why?', o: ['IDs are truly predictive', 'MDI is biased toward high-cardinality features with many split points', 'Permutation importance is broken', 'The forest has too few trees'], a: 1, e: 'Use permutation importance, which correctly gives it ≈ 0.' },
    { q: 'Three trees output (0, 0, 1). Majority vote and P(class 0)?', o: ['1, 1/3', '0, 2/3', '0, 1/3', '1, 2/3'], a: 1, e: 'Two of three vote 0.' }
  ]
});
