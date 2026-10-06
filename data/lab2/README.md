# Lab 2 simulated alignments

`pop_stable.nex`, `pop_expanding.nex` and `pop_bottleneck.nex` are made by `make_data.py` (msprime 1.4.4): 20 haploid sequences of 600 bp of non-recombining sequence from one panmictic population, μ = 7.5e-7 per site per generation.

| File | History | π | S | Tajima's D | D across 2000 replicates (95%) |
|---|---|---|---|---|---|
| pop_stable.nex | constant N = 10,000 | 8.22 | 30 | −0.11 | −1.70 to +1.80 |
| pop_expanding.nex | exponential growth from 500 to 200,000 over the last 2,000 generations | 1.82 | 13 | −1.82 | −2.32 to −0.73 |
| pop_bottleneck.nex | N = 10,000 until a crash to 200 150 generations ago, ongoing | 3.71 | 10 | +1.11 | −2.17 to +3.09 |

Each shipped file is the replicate closest to its scenario's median π, S and D. Values were checked with DendroPy 4.5.2 on the cluster using the lab's own calls. Rerun with `python make_data.py <outdir>`.

Students copy these from `~/groups/fslg_pws472/nobackup/archive/lab2/` on the cluster.
