---
layout: lab
lab_num: 6
title: "PCA and Admixture Analysis"
blurb: "Call genotype likelihoods with ANGSD, build a PCA with PCAngsd, and run admixture analysis with NGSAdmix on two populations of the Teton meltwater stonefly."
keywords: "pca principal component analysis admixture angsd pcangsd ngsadmix bam minimap2 lednia tetonica stonefly population structure skillet glacier wind cave"
# Checklist ids are the localStorage keys for student progress.
# Never renumber an existing id; give new items a new, unused id.
checklist:
  - id: 0
    text: "Create lab6 directory and copy the angsd folder"
  - id: 1
    text: "Create bamlist.txt of BAM files"
  - id: 2
    text: "Submit ANGSD genotype likelihood job"
  - id: 3
    text: "Run PCAngsd to generate covariance matrix"
  - id: 4
    text: "Plot PCA with PCA_plot.r"
  - id: 5
    text: "Run NGSAdmix with K=2"
  - id: 6
    text: "Plot admixture with admix_plot.r"
  - id: 7
    text: "Rerun with K=3 and K=4"
  - id: 8
    text: "Download plots with scp"
  - id: 9
    text: "Write lab report (combined with Lab 7)"
writeup:
  - "Clear methods for each analysis and what the software does"
  - "All generated plots included as figures"
  - "What do you notice about population clustering in the PCA?"
  - "Does the structure coincide with geography?"
  - "What changes as K increases in the admixture analysis?"
---

In Lab 5, you assembled the genome of _Lednia tetonica_. In this lab, we will use that genome to ask whether stoneflies living in different streams in the Teton Range are genetically distinct from one another. If populations are isolated, with little gene flow between them, each one may need to be managed as its own unit, and the loss of a single stream could mean the loss of unique genetic diversity.

The full study (collaborative unpublished work) sequenced 24 nymphs, six from each of four streams in Grand Teton National Park, with Illumina short reads. Each individual's reads were mapped to the chromosome-level _L. tetonica_ reference genome with `minimap2`. We will use two of those populations, which are about 25 km apart:

| Population | Code | Latitude | Longitude | Individuals |
|---|---|---|---|---|
| Skillet Glacier | SG | 43.8389 | -110.7586 | SG_01 to SG_06 |
| Wind Cave | WC | 43.6655 | -110.9561 | WC_01 to WC_06 |

To keep run times short, I have kept only the reads that mapped to **chromosome 4** (`LtChr4`, about 30.2 Mb, or roughly 7% of the genome) and marked PCR duplicates with `samtools markdup`. Each individual has about 17-26x coverage on this chromosome after duplicates are removed. You will call genotype likelihoods with `ANGSD`, and then create a PCA plot and an admixture plot. Twelve individuals is a small sample for an admixture analysis, but the process would be the same with a larger sample size.

Reminder, that you should create your own folder in which to run these analyses, ideally in your `~/nobackup/archive` directory (rather than in the class shared directory).

### 1. Create a `lab6` directory and copy the `angsd` folder
The shared `lab6_lednia` folder has three folders: `genome` (the `LtChr4` reference sequence), `bams` (one `BAM` file per individual, about 2.9 GB in total), and `angsd` (the scripts and sample list you will use below). The `BAM` files are large, so we will read them directly from the shared folder and copy only the `angsd` folder.
```
cd ~/nobackup/archive
mkdir lab6
cd lab6
cp -r ~/groups/fslg_pws472/nobackup/archive/lab6_lednia/angsd ./
ls ~/groups/fslg_pws472/nobackup/archive/lab6_lednia/bams
```

### 2. Generate genotype likelihoods with `ANGSD`

With 20-30x coverage per individual, we could call genotypes directly, but `ANGSD` instead works with _genotype likelihoods_: the probability of the sequencing data under each possible genotype. This lets it carry the uncertainty from sequencing errors and low depth into the downstream analyses, rather than forcing a single best-guess genotype at every site.

We're going to create a file called `bamlist.txt` in the `angsd` directory. This file will have the paths to all of the bam files that we will use for this step.

You can create this list with the command:
```
cd angsd
ls ~/groups/fslg_pws472/nobackup/archive/lab6_lednia/bams/*.LtChr4.bam > bamlist.txt
```
When you create it, if you view it with `cat`, it should list 12 files ending like the following (the start of each path will include your home directory):
```
.../lab6_lednia/bams/SG_01.LtChr4.bam
.../lab6_lednia/bams/SG_02.LtChr4.bam
.../lab6_lednia/bams/SG_03.LtChr4.bam
.../lab6_lednia/bams/SG_04.LtChr4.bam
.../lab6_lednia/bams/SG_05.LtChr4.bam
.../lab6_lednia/bams/SG_06.LtChr4.bam
.../lab6_lednia/bams/WC_01.LtChr4.bam
.../lab6_lednia/bams/WC_02.LtChr4.bam
.../lab6_lednia/bams/WC_03.LtChr4.bam
.../lab6_lednia/bams/WC_04.LtChr4.bam
.../lab6_lednia/bams/WC_05.LtChr4.bam
.../lab6_lednia/bams/WC_06.LtChr4.bam
```
Now create a new job file called `angsd_geno_like.job`.
Remember that you can do this with the job script generator from the [supercomputer website](https://rc.byu.edu/documentation/slurm/script-generator).

You should choose 12 CPUs, 4GB of RAM per CPU, and a wall-time of 1 hour. The `ANGSD` command to calculate genotype likelihoods for a PCA is:
```
source ~/groups/fslg_pws472/.bashrc
conda activate angsd
angsd -GL 1 -out lednia_PCA -nThreads $SLURM_NPROCS -doGlf 2 -doMajorMinor 1 -SNP_pval 1e-6 -doMaf 1 \
  -minMapQ 30 -minQ 20 -minInd 10 -bam bamlist.txt
```
Here is what each option does:

- `-GL 1` calculates genotype likelihoods with the SAMtools model.
- `-doGlf 2` writes the likelihoods in `BEAGLE` format, which `PCAngsd` and `NGSadmix` read.
- `-doMajorMinor 1` and `-doMaf 1` infer the major and minor allele and estimate the allele frequency at each site.
- `-SNP_pval 1e-6` keeps only sites that are very likely to be variable (SNPs).
- `-minMapQ 30` and `-minQ 20` ignore reads that map ambiguously and bases with low quality. More than half of the _L. tetonica_ genome is repetitive, so ignoring ambiguously mapped reads matters here.
- `-minInd 10` keeps only sites where at least 10 of the 12 individuals have data.

To submit the job, use:
```
sbatch angsd_geno_like.job
```
It took about 5 minutes when I tested it. When it is complete, look at the files in your directory. You should have three new files: `lednia_PCA.arg`, `lednia_PCA.beagle.gz`, and `lednia_PCA.mafs.gz`. Count the number of SNPs (one line per SNP, plus a header line) with:
```
zcat lednia_PCA.beagle.gz | tail -n +2 | wc -l
```
You should find roughly 180,000 SNPs out of the roughly 28 million sites on `LtChr4` that had enough data to analyze. For the next step, we're going to generate a covariance matrix using the beagle file (which contains the genotype likelihoods) using `PCAngsd`.

### 3. Generate a covariance matrix using `PCAngsd`

In this step, we're going to use the `lednia_PCA.beagle.gz` file to create a covariance matrix in `PCAngsd`. To create the covariance matrix, run the following in your terminal:
```
source ~/groups/fslg_pws472/.bashrc
conda activate angsd
python ~/groups/fslg_pws472/apps/miniconda3/envs/angsd/bin/pcangsd-v.0.99/pcangsd.py -b lednia_PCA.beagle.gz -o lednia_PCA
```
After this is finished running, you should have a file in your directory called `lednia_PCA.cov`. This is your covariance matrix and can be used to generate your PCA.

### 4. Create your PCA plot

You can plot the PCA with the `PCA_plot.r` script. In order to run it, you need a list with the sample names in the same order as the original `bamlist.txt`. This list is in `lednia_pop.txt`, which should already be in your `angsd` folder along with the script and your covariance matrix (if not, you can copy them from `~/groups/fslg_pws472/nobackup/archive/lab6_lednia/angsd`). Check that the order matches your `bamlist.txt`.
```
conda deactivate
conda activate r
Rscript PCA_plot.r
```
This creates `PCA_lednia.png`. Each point is one individual, colored by population, and the axis labels show the percentage of the genetic variation explained by each principal component.

### 5. Run Admixture analysis with `NGSAdmix`

`NGSAdmix` is now part of the `ANGSD` package and can perform admixture analysis using the beagle file of genotype likelihoods that you generated in step 2. Create a job file with the following commands, using 12 CPUs, 4GB of RAM per CPU, and a wall-time of 1 hour. The parameter that you need to think about here is `K`, which as you learned in the lecture is the number of ancestral populations. Since we sampled two populations in this dataset, Skillet Glacier and Wind Cave, we will start by setting `K` to 2.
```
source ~/groups/fslg_pws472/.bashrc
conda activate angsd
NGSadmix -likes lednia_PCA.beagle.gz -K 2 -o lednia_admix_K2 -P $SLURM_NPROCS
```
When the job is finished, you will have a couple of new files in the `angsd` directory. `lednia_admix_K2.fopt.gz` is a gzipped file that contains the estimated allele frequencies for each population for each locus. `lednia_admix_K2.qopt` contains the estimated admixture proportions for each individual (one row per individual, in the same order as `bamlist.txt`, and one column per ancestral population).

### 6. Create simple admixture plot
Now we will create a simple admixture plot using our results from `NGSadmix`.
Check that you have the script `admix_plot.r` in your `angsd` directory or copy it from `~/groups/fslg_pws472/nobackup/archive/lab6_lednia/angsd/`.
Make sure that `lednia_pop.txt` is still in your directory. The script takes the prefix of your `NGSadmix` output as its argument. This is another fast script, which is fine to run directly in your terminal.
```
conda activate r
Rscript admix_plot.r lednia_admix_K2
```
You will now have a plot in an image called `lednia_admix_K2.png`. Each bar is one individual, and the colors show what proportion of its ancestry is assigned to each of the `K` ancestral populations. Feel free to download it and take a look.

### 7. Rerun steps 5 and 6 with a `K` of 3 and a `K` of 4
Re-run steps 5 and 6 with different `K` values. Change both the `-K` value and the `-o` name in your job file (for example, `-K 3 -o lednia_admix_K3`) so that you don't overwrite your first results, and then plot each one:
```
Rscript admix_plot.r lednia_admix_K3
Rscript admix_plot.r lednia_admix_K4
```
What do you notice?

### 8. Download the plots with `scp` or similar.
See [here](https://rc.byu.edu/wiki/?id=Transferring+Files) for more details.

### 9. For the Lab write-up
This lab will be combined with lab 7 into a single lab write-up (double the amount of points and double the length). However, feel free to get started with this one. Consider the following as you write it up:
- Your lab write-up should contain clear methods on which analyses you performed and why
- When introducing each method, you should give a short explanation of what the software is actually doing
- Any plots that you generate should be included as figures

For the Discussion:
- Think about what you learned about these populations with the PCA. What do you notice? How are the individuals clustering? Do you observe any population structure? Does it coincide with geography?
- For the admixture analysis, what do you see at `K` = 2? What changes as you increase `K` to 3 and 4? Do the extra ancestry components correspond to real, separate populations? (_Hint:_ the six nymphs from one stream may include close relatives, such as siblings. How could that affect an admixture analysis with so few individuals?) Is there any evidence of gene flow (mixed ancestry) between Skillet Glacier and Wind Cave?
- We only used one chromosome (about 7% of the genome) and two of the four sampled populations. How might your results change with the whole genome? With all four populations? Note that two of the four populations in the full study, Cloud Veil and Dartmouth Basin, are only a few kilometers apart. Would you expect them to be as distinct as Skillet Glacier and Wind Cave?
- What do your results mean for the conservation of _L. tetonica_? If the populations in different streams exchange few or no migrants, what could happen if one stream warms or its glacier disappears?
