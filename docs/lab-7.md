---
layout: lab
lab_num: 7
title: "Demographic Histories with PSMC"
blurb: "Reconstruct the population size history of the Teton meltwater stonefly from a single resequenced genome using the pairwise sequential Markovian coalescent."
keywords: "psmc demographic history pairwise sequential markovian coalescent bcftools samtools mpileup population size lednia tetonica stonefly glaciation"
# Checklist ids are the localStorage keys for student progress.
# Never renumber an existing id; give new items a new, unused id.
checklist:
  - id: 0
    text: "Create lab7 directory and copy the genome and SG_04 BAM"
  - id: 1
    text: "Run bcftools mpileup/call to create diploid FASTQ"
  - id: 2
    text: "Convert to PSMC FASTA with fq2psmcfa"
  - id: 3
    text: "Run single PSMC analysis"
  - id: 4
    text: "Generate PSMC plot"
  - id: 6
    text: "Download PSMC plot"
  - id: 7
    text: "Write combined lab 6+7 report"
writeup:
  - "Describe the PSMC trajectory: when did Ne rise and fall?"
  - "How does your curve compare to the whole-genome curves from the full study?"
  - "How do the mutation rate and generation time assumptions affect the plot?"
  - "Why is a single chromosome less reliable than the whole genome?"
---

In Lab 6, we used many individuals to look at how genetic variation is distributed _among_ populations today. In this lab, we will use the genome of a single individual to look back in time.

Every diploid individual carries two copies of each chromosome, one from each parent. If we trace those two copies back in time, at some point they _coalesce_ in a single ancestral copy. The time back to that common ancestor varies along the genome, because recombination has broken the chromosome into segments with different histories. Regions where the two copies are very different (many heterozygous sites) coalesced long ago, and regions where they are nearly identical coalesced recently. Coalescence happens faster when a population is small, so the distribution of these coalescence times tells us about how the effective population size (_N<sub>e</sub>_) has changed through time. The pairwise sequential Markovian coalescent (`PSMC`) uses the pattern of heterozygous sites along a single diploid genome to infer that history.

We will run `PSMC` on one female nymph from Skillet Glacier, **SG_04**, using the same chromosome 4 (`LtChr4`) data from Lab 6. (We use a female because stoneflies have an XO sex-determination system, so males have only one copy of the X chromosome. That doesn't matter for `LtChr4`, which is an autosome, but it would matter for the X.) In the full study (collaborative unpublished work), `PSMC` was run on the whole genome of all 24 individuals. Using only one chromosome keeps this lab fast, but it also gives `PSMC` much less information, so keep that in mind when you interpret your plot.

The first thing you'll want to do is create a `lab7` directory in your `~/nobackup/archive` directory. Change directories into your newly created `lab7` directory. Then copy the `genome` directory and the SG_04 `BAM` file (and its `.bai` index) from `~/groups/fslg_pws472/nobackup/archive/lab6_lednia` into your new `lab7` directory.
```
cd ~/nobackup/archive
mkdir lab7
cd lab7
cp -r ~/groups/fslg_pws472/nobackup/archive/lab6_lednia/genome ./
mkdir bams psmc jobs
cp ~/groups/fslg_pws472/nobackup/archive/lab6_lednia/bams/SG_04.LtChr4.bam* bams/
cd jobs
```

### 1. Identify heterozygous sites using `bcftools`, then export to a diploid `FASTQ` that can be converted into a special `PSMC` `FASTA` file.

The commands below do three things:

1. `bcftools mpileup` and `bcftools call` look at all of the reads covering each position of `LtChr4` and decide whether SG_04 is homozygous or heterozygous at that position.
2. `vcfutils.pl vcf2fq` turns those calls into a single "diploid consensus" sequence, using IUPAC ambiguity codes for heterozygous sites. Positions with too little or too much coverage are masked.
3. `gzip` compresses the output.

The `-d` parameter is the minimum depth, which should be about 1/3 of the average depth of coverage, and `-D` is the maximum depth, which should be about twice the average depth of coverage. Very low depth makes it hard to see both alleles at a heterozygous site, and unusually high depth often indicates collapsed repeats, where reads from several copies of a repeat pile up in one place. SG_04 has an average depth of about 23x on `LtChr4` (after duplicates are removed), so we will use `-d 8` and `-D 46`.

Create a job file called `diploid_fastq.job` in your `jobs` directory with 1 CPU, 8 GB of RAM, and a wall-time of 1 hour, and add the following commands:
```
source ~/groups/fslg_pws472/.bashrc
conda activate samtools
bcftools mpileup -C50 -Ou -f ../genome/LtChr4.fasta ../bams/SG_04.LtChr4.bam | bcftools call -c - | vcfutils.pl vcf2fq -d 8 -D 46 | gzip > ../psmc/SG_04.diploid.fq.gz
```
Submit it with `sbatch diploid_fastq.job`. It took about 12 minutes when I tested it.

### 2. `PSMC`

In this step, we will create the `PSMC` `FASTA` file and then run `PSMC`. Create a job file called `psmc.job` in your `jobs` directory with 1 CPU, 8 GB of RAM, and a wall-time of 1 hour, and add the following commands:
```
module load psmc
fq2psmcfa -q20 ../psmc/SG_04.diploid.fq.gz > ../psmc/SG_04.psmcfa
psmc -N25 -t15 -r5 -p "4+25*2+4+6" -o ../psmc/SG_04.psmc ../psmc/SG_04.psmcfa
```
`fq2psmcfa` divides the genome into bins of 100 bp and records whether each bin contains a heterozygous site. `psmc` then fits the model, using up to 25 iterations (`-N25`), a maximum coalescent time of 15 (`-t15`, in units of 2_N_<sub>0</sub> generations), an initial ratio of mutation rate to recombination rate of 5 (`-r5`), and 64 time intervals grouped into 28 free parameters (`-p "4+25*2+4+6"`). These are the same settings used in the full study. Submit the job with `sbatch psmc.job`. It took about 2 minutes when I tested it.

### 3. Plot the `PSMC` results

`PSMC` reports time and population size in scaled units. To convert them to years and individuals, we need two numbers:

- **The mutation rate per site per generation (`-u`).** No mutation rate has been estimated for stoneflies, so, as in the full study, we will use the rate measured for _Drosophila melanogaster_, 2.8 × 10<sup>-9</sup> (Keightley _et al._ 2014).
- **The generation time in years (`-g`).** _L. tetonica_ nymphs spend one to two years in the stream before emerging as adults, so we will use 1.5 years.

The plotting is quick, so go ahead and run it directly in your `lab7/psmc` directory.
```
cd ../psmc
module load gnuplot
module load psmc
module load texlive
psmc_plot.pl -p -u 2.8e-09 -g 1.5 SG_04_psmc SG_04.psmc
```
This creates `SG_04_psmc.pdf` (and `SG_04_psmc.eps`). The x-axis is time before the present in years, on a log scale, and the y-axis is the effective population size. Read the plot from right (long ago) to left (recently).

### 4. Download the plot with `scp` or similar.
See [here](https://rc.byu.edu/wiki/?id=Transferring+Files) for more details.

### Key takeaways for the lab write-up (to be combined with lab 6)

- Describe your `PSMC` curve. When was the effective population size of this lineage at its largest? When did it decline?
- In the full study, which used the whole genome, the `PSMC` curves of all 24 individuals followed a similar pattern. _N<sub>e</sub>_ peaked at about 250,000 roughly one million years ago, declined to about 80,000 by roughly 100,000 years ago, then rose and fell again between 100,000 and 10,000 years ago. How does your curve compare? What parts are similar, and what parts differ?
- Your analysis used one chromosome, about 7% of the genome. Why would `PSMC` estimates from a single chromosome be noisier than estimates from the whole genome? (_Hint:_ think about how many independent segments with different coalescence times there are along one chromosome compared to all of them.)
- How would your plot change if the true mutation rate of stoneflies were twice the _Drosophila_ rate? If the generation time were 1 year instead of 1.5? Which axes would shift, and in which direction?
- The Teton Range was heavily glaciated during the last glacial period, and the glaciers retreated after about 15,000 years ago. `PSMC` has little power in the most recent ~10,000-20,000 years. What does that mean for using `PSMC` to understand how recent warming and glacier loss are affecting _L. tetonica_? What other data or methods could address that?
- **Optional:** If you have time, repeat steps 1-3 for a Wind Cave individual (for example, WC_05) and compare the two curves. You will need to copy its `BAM` file, and adjust `-d` and `-D` for its depth of coverage (WC_05 has about 17x on `LtChr4`).
