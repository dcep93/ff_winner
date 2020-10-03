function renderDistribution(distribution: dataToDistributionType) {
  console.log(arguments.callee.name);
  console.log(
    distribution.map((d) => d.map((i) => i.p * i.v).reduce((a, b) => a + b, 0))
  );
}
