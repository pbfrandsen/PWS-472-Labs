"""Simulate the three Lab 2 alignments (stable, expanding, bottleneck).

Each alignment is 20 haploid sequences of 600 bp of non-recombining
sequence (think mtDNA) sampled from one panmictic population. For each
scenario we simulate many replicates and ship the one closest to that
scenario's median pi, S and Tajima's D, so the file is typical rather than
cherry-picked. The chosen seed is printed so every file can be rebuilt.

    python make_data.py [outdir]
"""
import sys
import numpy as np
import msprime

N_SAMPLES = 20
LENGTH = 600
MU = 7.5e-7          # per site per generation
N_REF = 10_000       # long-term (ancestral) population size
REPS = 2000


def demography(scenario):
    d = msprime.Demography()
    if scenario == "stable":
        d.add_population(name="pop", initial_size=N_REF)
    elif scenario == "expanding":
        # Exponential growth from N_REF/20 over the last 2000 generations.
        t, n_now = 2000, 200_000
        d.add_population(name="pop", initial_size=n_now,
                         growth_rate=np.log(n_now / (N_REF / 20)) / t)
        d.add_population_parameters_change(time=t, growth_rate=0,
                                           initial_size=N_REF / 20)
    elif scenario == "bottleneck":
        # Crash to N = 200 that started 150 generations ago and is ongoing.
        d.add_population(name="pop", initial_size=200)
        d.add_population_parameters_change(time=150, initial_size=N_REF)
    return d


def simulate(scenario, seed):
    ts = msprime.sim_ancestry(N_SAMPLES, ploidy=1, sequence_length=LENGTH,
                              recombination_rate=0, demography=demography(scenario),
                              random_seed=seed)
    ts = msprime.sim_mutations(ts, rate=MU, model=msprime.JC69(),
                               random_seed=seed)
    rng = np.random.default_rng(seed)
    ref = "".join(rng.choice(list("ACGT"), LENGTH))
    return list(ts.alignments(reference_sequence=ref))


def stats(aln):
    """pi, S and Tajima's D, computed the same way as DendroPy's popgenstat."""
    a = np.array([list(s) for s in aln])
    n = len(a)
    S = int(sum(len(set(col)) > 1 for col in a.T))
    diffs = sum((a[i] != a[j]).sum() for i in range(n) for j in range(i + 1, n))
    pi = diffs / (n * (n - 1) / 2)
    i = np.arange(1, n)
    a1, a2 = (1 / i).sum(), (1 / i**2).sum()
    b1 = (n + 1) / (3 * (n - 1))
    b2 = 2 * (n**2 + n + 3) / (9 * n * (n - 1))
    c1, c2 = b1 - 1 / a1, b2 - (n + 2) / (a1 * n) + a2 / a1**2
    e1, e2 = c1 / a1, c2 / (a1**2 + a2)
    D = (pi - S / a1) / np.sqrt(e1 * S + e2 * S * (S - 1)) if S else float("nan")
    return pi, S, D


def write_nexus(path, aln):
    with open(path, "w") as f:
        f.write("#NEXUS\n\nBegin data;\n")
        f.write(f"    Dimensions ntax={len(aln)} nchar={LENGTH};\n")
        f.write("    Format datatype=dna;\n    Matrix\n\n")
        for k, seq in enumerate(aln, 1):
            f.write(f"ind{k:02d} {seq}\n")
        f.write("    ;\nEnd;\n")


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "."
    for base, scenario in [(1_000_000, "stable"), (2_000_000, "expanding"),
                           (3_000_000, "bottleneck")]:
        seeds = range(base + 1, base + REPS + 1)
        res = [(seed, *stats(simulate(scenario, seed))) for seed in seeds]
        arr = np.array([r[1:] for r in res])          # columns: pi, S, D
        arr = arr[~np.isnan(arr).any(axis=1)]
        meds, sds = np.median(arr, axis=0), arr.std(axis=0)
        # Most typical replicate: closest to the median of pi, S and D jointly.
        seed, pi, S, D = min((r for r in res if not np.isnan(r[3])),
                             key=lambda r: np.abs((np.array(r[1:]) - meds) / sds).sum())
        Ds, med = arr[:, 2], meds[2]
        lo, hi = np.nanpercentile(Ds, [2.5, 97.5])
        write_nexus(f"{outdir}/pop_{scenario}.nex", simulate(scenario, seed))
        print(f"{scenario:10s} seed={seed} pi={pi:.2f} S={S} D={D:+.2f} | "
              f"median D={med:+.2f}, 95% of reps in [{lo:+.2f}, {hi:+.2f}], "
              f"median pi={meds[0]:.2f}, median S={meds[1]:.0f}")
