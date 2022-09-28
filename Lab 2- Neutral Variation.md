## Lab 2: Neutral Variation
In this lab we will take a look at a few sample files: One with mitochondrial data from primates and another with two populations of stickleback fish that includes individuals from the Eastern Pacific and from the Western Pacific (you can look at the paper here: [https://doi.org/10.1111/j.1558-5646.1994.tb01348.x](https://doi.org/10.1111/j.1558-5646.1994.tb01348.x)

We will be using the Python package `dendropy` to generate summary statistics about the two populations, including Tajima's D. 

First, login to the supercomputer using PuTTy or your Mac terminal.

Then, load conda and activate the `dendropy` environment:
```
module load miniconda3/4.12-pws-472
conda activate dendropy
```
Now, move to your compute directory and copy the data for today's lab into your directory:
```
cd ~/compute
cp -r ~/fsl_groups/fslg_pws472/compute/lab2 ./
```
Now, move into the `lab2` directory:
```
cd lab2
```
If you want to look at the alignments, you can with the `cat` command. e.g.:
```
cat primate.nex
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
The first thing we are going to do is to simply look at the primate mitochondrial alignment and estimate the average number of pairwise differences and the number of segregating sites (both important pieces of estimating Tajima's D).

To load the primate mitochondrial alignment, enter:
```
primate_mito = dendropy.DnaCharacterMatrix.get_from_path("primate.nex", schema="nexus")
```

Now let's take a look at the average number of pairwise differences (keep in mind that you'll put these in a table in your lab write-up):
```
print(popgenstat.average_number_of_pairwise_differences(primate_mito))
```
And the number of segregating sites:
```
print(popgenstat.num_segregating_sites(primate_mito))
```
And, finally, Tajima's D:
```
print(popgenstat.tajimas_d(primate_mito))
```
Now, we'll look at something with multiple populations. Let's load the stickleback dataset:
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
Things to keep in mind for your lab write-up:
1. What were the scores for nucleotide diversity, pi (mean number of pairwise differences)?
2. What about, S (the number of segregating sites)?
3. What were the values of Tajima's D?
4. What kind of inferences can we make from these values?
