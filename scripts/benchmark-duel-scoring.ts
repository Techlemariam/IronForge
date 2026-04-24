/**
 * Benchmark script to compare sequential vs parallel processing of duels.
 */

const LATENCY = 20; // Simulated network latency in ms

async function mockDbCall() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY));
}

async function calculateDuelScoreMock() {
  await mockDbCall();
  return Math.floor(Math.random() * 1000);
}

async function calculateRewardsMock() {
  await mockDbCall();
  return { xp: 10, gold: 10, kineticEnergy: 10 };
}

const EXPIRED_DUELS_COUNT = 10;
const expiredDuels = Array.from({ length: EXPIRED_DUELS_COUNT }, (_, i) => ({
  id: `duel-${i}`,
  challengerId: `user-c-${i}`,
  defenderId: `user-d-${i}`,
  challenger: { pvpProfile: { duelElo: 1200, duelsWon: 5, duelsLost: 5 } },
  defender: { pvpProfile: { duelElo: 1200, duelsWon: 5, duelsLost: 5 } },
  startDate: new Date(),
  endDate: new Date(),
}));

async function runSequential() {
  const start = Date.now();
  let awaitPoints = 0;

  for (const duel of expiredDuels) {
    // 1 & 2. Calculate final scores
    await calculateDuelScoreMock();
    awaitPoints++;
    await calculateDuelScoreMock();
    awaitPoints++;

    // 3. Update duel
    await mockDbCall();
    awaitPoints++;

    // 4. Import service (simulated)
    await mockDbCall();
    awaitPoints++;

    // 5. Winner rewards calculation
    await calculateRewardsMock();
    awaitPoints++;
    // 6. Winner user update
    await mockDbCall();
    awaitPoints++;

    // 7. Loser rewards calculation
    await calculateRewardsMock();
    awaitPoints++;
    // 8. Loser user update
    await mockDbCall();
    awaitPoints++;

    // 9. Update PvpProfile Challenger
    await mockDbCall();
    awaitPoints++;
    // 10. Update PvpProfile Defender
    await mockDbCall();
    awaitPoints++;
  }

  const end = Date.now();
  return { name: 'Sequential (Current)', duration: end - start, awaitPoints };
}

async function runParallel() {
  const start = Date.now();
  let awaitPoints = 0;

  // Move import outside (simulated)
  // await mockDbCall(); awaitPoints++; // Not really an await point if moved to top

  const processDuel = async (duel: any) => {
    // Parallelize score calculations
    await Promise.all([calculateDuelScoreMock(), calculateDuelScoreMock()]);

    // Determine winner logic (sync)
    const winnerId = duel.challengerId;

    // Parallelize rewards calculations
    await Promise.all([calculateRewardsMock(), calculateRewardsMock()]);

    // Return updates (simulated)
    return [
      { type: 'duel', id: duel.id },
      { type: 'user', id: duel.challengerId },
      { type: 'user', id: duel.defenderId },
      { type: 'profile', id: duel.challengerId },
      { type: 'profile', id: duel.defenderId },
    ];
  };

  // 1. Process all duels in parallel
  const results = await Promise.all(expiredDuels.map(processDuel));
  awaitPoints++; // One await for all parallel processes

  // 2. Execute all updates in a single transaction
  await mockDbCall();
  awaitPoints++;

  const end = Date.now();
  return { name: 'Parallel (Optimized)', duration: end - start, awaitPoints };
}

async function main() {
  console.log(`--- Benchmarking Duel Scoring with ${EXPIRED_DUELS_COUNT} duels ---`);
  console.log(`Simulated Latency: ${LATENCY}ms per DB call\n`);

  const seqResult = await runSequential();
  console.log(`${seqResult.name}:`);
  console.log(`  Duration: ${seqResult.duration}ms`);
  console.log(`  Sequential Await Points: ${seqResult.awaitPoints}`);

  const parResult = await runParallel();
  console.log(`\n${parResult.name}:`);
  console.log(`  Duration: ${parResult.duration}ms`);
  console.log(`  Sequential Await Points: ${parResult.awaitPoints}`);

  const improvement = (
    ((seqResult.duration - parResult.duration) / seqResult.duration) *
    100
  ).toFixed(2);
  console.log(`\nEstimated Speedup: ${improvement}%`);
}

main().catch(console.error);
