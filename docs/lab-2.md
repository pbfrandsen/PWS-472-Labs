---
layout: lab
lab_num: 2
title: "Neutral Variation"
blurb: "Calculate Tajima's D, nucleotide diversity, and segregating sites for simulated populations with known histories and for stickleback fish using DendroPy."
keywords: "tajima d dendropy neutral variation segregating sites pairwise differences pi nucleotide diversity stickleback simulated population expansion bottleneck demography"
# Checklist ids are the localStorage keys for student progress.
# Never renumber an existing id; give new items a new, unused id.
checklist:
  - id: 0
    text: "SSH and activate the dendropy environment"
  - id: 1
    text: "Copy the lab2 data to your directory"
  - id: 8
    text: "Calculate π, S, and Tajima's D for the stable population"
  - id: 9
    text: "Calculate π, S, and Tajima's D for the expanding population"
  - id: 10
    text: "Calculate π, S, and Tajima's D for the bottlenecked population"
  - id: 5
    text: "Load the stickleback dataset and split populations"
  - id: 6
    text: "Calculate all PopulationPairSummaryStatistics"
  - id: 11
    text: "Calculate Tajima's D within each stickleback population"
  - id: 7
    text: "Record values and answer write-up questions"
writeup:
  - "A table of π, S, and Tajima's D for the three simulated populations and for the stickleback data (pooled, EPAC only, and WPAC only)."
  - "Did the sign of Tajima's D match what you expected for each simulated history? Explain why each history produces that pattern."
  - "Why is Tajima's D for the pooled stickleback sample different from the values within each population?"
  - "What can (and can't) Tajima's D tell you about a population's history?"
---

In this lab we will take a look at a few sample files. The first three are simulated mitochondrial-like alignments, each from a single population whose demographic history we know. The last is a real dataset with two populations of stickleback fish that includes individuals from the Eastern Pacific and from the Western Pacific (you can look at the paper here: [https://doi.org/10.1111/j.1558-5646.1994.tb01348.x](https://doi.org/10.1111/j.1558-5646.1994.tb01348.x))

We will be using the Python package `dendropy` to generate summary statistics about these populations, including Tajima's D. 

First, login to the supercomputer using PuTTy or your Mac terminal.

Then, load conda and activate the `dendropy` environment:
```
source ~/groups/fslg_pws472/.bashrc
conda activate dendropy
```
Now, move to your archive directory and copy the data for today's lab into your directory:
```
cd ~/nobackup/archive
cp -r ~/groups/fslg_pws472/nobackup/archive/lab2/ ./
```
Now, move into the `lab2` directory:
```
cd lab2
```
If you want to look at the alignments, you can with the `cat` command. e.g.:
```
cat pop_stable.nex
```
Now start up Python with the command:
```
python
```
Then you'll want to import the `dendropy` library and the `popgenstat` module within `dendropy` with:
```
import dendropy
from dendropy.calculate import popgenstat
```

### Simulated populations with known histories

Tajima's D compares two estimates of genetic diversity, π (the average number of pairwise differences) and S (the number of segregating sites), that should agree if a population has been a constant size and evolving neutrally. When the population's history departs from that, the two estimates come apart, and D moves away from zero.

The trouble with real data is that we never know the true history, so we can't check whether D got it right. So we'll start with three simulated datasets where we do. Each one has 20 sequences, 600 bp long, sampled from a single, randomly mating population:

* `pop_stable.nex`: the population has been the same size for its entire history.
* `pop_expanding.nex`: the population has been growing exponentially for the last 2,000 generations, from 500 to 200,000 individuals.
* `pop_bottleneck.nex`: the population was 10,000 individuals until it crashed to 200 individuals 150 generations ago, and it has stayed small since.

Before you run anything, write down whether you expect Tajima's D to be positive, negative, or near zero for each one.

Let's start with the stable population. Load the alignment:
```
stable = dendropy.DnaCharacterMatrix.get_from_path("pop_stable.nex", schema="nexus")
```
Now let's take a look at the average number of pairwise differences (keep in mind that you'll put these in a table in your lab write-up):
```
print(popgenstat.average_number_of_pairwise_differences(stable))
```
And the number of segregating sites:
```
print(popgenstat.num_segregating_sites(stable))
```
And, finally, Tajima's D:
```
print(popgenstat.tajimas_d(stable))
```
Now do the same for the expanding population:
```
expanding = dendropy.DnaCharacterMatrix.get_from_path("pop_expanding.nex", schema="nexus")
print(popgenstat.average_number_of_pairwise_differences(expanding))
print(popgenstat.num_segregating_sites(expanding))
print(popgenstat.tajimas_d(expanding))
```
And for the bottlenecked population:
```
bottleneck = dendropy.DnaCharacterMatrix.get_from_path("pop_bottleneck.nex", schema="nexus")
print(popgenstat.average_number_of_pairwise_differences(bottleneck))
print(popgenstat.num_segregating_sites(bottleneck))
print(popgenstat.tajimas_d(bottleneck))
```
Did the values match your predictions? Keep in mind that each file is one draw from a random process. If we simulated each history thousands of times, Tajima's D would vary quite a bit from one replicate to the next (95% of replicates of the stable population fall between about −1.7 and +1.8, for example), so we can't learn everything from a single locus. These three files were chosen to be typical for their history.

### Stickleback populations

Now, we'll look at real data with multiple populations. Let's load the stickleback dataset:
```
seqs = dendropy.DnaCharacterMatrix.get_from_path("orti1994.nex", schema="nexus")
```
We'll initiate two populations. Don't worry so much about the Python code here, but it is basically separating to two populations based on the taxon names:
```
p1 = []
p2 = []
for idx, t in enumerate(seqs.taxon_namespace):
    if t.label.startswith('EPAC'):
        p1.append(seqs[t])
    else:
        p2.append(seqs[t])
```
Now we're going to calculate all of the population genetics summary statistics with one command for the populations and then print them out, one by one.
```
pp = popgenstat.PopulationPairSummaryStatistics(p1, p2)
```
Let's look at the pairwise differences within the total dataset, and then each between and within populations (keep these for a table for the lab write-up):
```
print('Average number of pairwise differences (total): %s' % pp.average_number_of_pairwise_differences)
print('Average number of pairwise differences (between populations): %s' % pp.average_number_of_pairwise_differences_between)
print('Average number of pairwise differences (within populations): %s' % pp.average_number_of_pairwise_differences_within)
print('Average number of pairwise differences (net): %s' % pp.average_number_of_pairwise_differences_net)
```
Then, we can take a look at the number of segregating sites:
```
print('Number of segregating sites: %s' % pp.num_segregating_sites)
```
And, finally, estimate Tajima's D:
```
print("Tajima's D: %s" % pp.tajimas_d)
```
This value of Tajima's D treats all of the fish as if they were one population. But Tajima's D assumes that all of the sequences come from a single, randomly mating population, and the pairwise differences above suggest that the Eastern and Western Pacific fish are not one population. Let's calculate Tajima's D within each population separately. These commands make a copy of the alignment for each population that keeps only that population's sequences:
```
epac = seqs.clone(depth=1)
epac.keep_sequences([t for t in epac.taxon_namespace if t.label.startswith('EPAC')])
wpac = seqs.clone(depth=1)
wpac.keep_sequences([t for t in wpac.taxon_namespace if t.label.startswith('WPAC')])
print("Tajima's D (EPAC only): %s" % popgenstat.tajimas_d(epac))
print("Tajima's D (WPAC only): %s" % popgenstat.tajimas_d(wpac))
```
Compare these to the pooled value. Pooling sequences from distinct populations creates many variants at intermediate frequency (each one common in one population and rare in the other), and those raise π more than they raise S. The same thing happens, even more strongly, if you calculate Tajima's D on sequences from different species, which is why Tajima's D is only meaningful within a population.

Things to keep in mind for your lab write-up:
1. What were the scores for nucleotide diversity, aka π (mean number of pairwise differences), S (the number of segregating sites), and Tajima's D for each dataset?
2. Did the sign of Tajima's D match what you expected for each simulated history? Why does each history produce that pattern?
3. Why is Tajima's D for the pooled stickleback sample different from the values within each population?
4. What kind of inferences can we make from these values, and what are their limits?
