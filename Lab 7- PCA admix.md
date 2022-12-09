## Lab 7: PCA admix

For this lab, we will be using `bam` files output from `bowtie2` (a read-mapping program), calling variants with `ANGSD`, and then creating a PCA plot and an ADMIXTURE plot. Note that this is a very small sample size for an admixture plot, however, the process would be the same with a larger sample size.

We will be using samfiles that I have already mapped reads to. Reminder, that you should create your own folder in which to run these analyses, ideally in your `~/compute` directory (rather than in the class shared directory).

### 1. Copy the `lab7` directory to your `compute` directory
```
cd ~/compute
cp -r ~/fsl_groups/fslg_pws472/compute/lab7 ./
cd lab7
```

### 2. Generate genotype likelihoods with `ANGSD`
We're going to create a file called  `bamlist.txt` in the `angsd` directory. This file will have relative paths to all of the bam files that we will use for this step.
    
You can create this list with the command:
```
cd angsd
ls ../variants/*mdup.bam > bamlist.txt
```
When you create it, if you view it with `cat`, it should look something like the following:  
```
../variants/JH-12872_AGTCAA.sam.sorted.bam.mdup.bam
../variants/MB-12866_GTTTCG.sam.sorted.bam.mdup.bam
../variants/MB-12867_TTAGGC.sam.sorted.bam.mdup.bam
../variants/MB-12868_TGACCA.sam.sorted.bam.mdup.bam
../variants/MB-S5_CAGATC.sam.sorted.bam.mdup.bam
../variants/MB-S6_ACTTGA.sam.sorted.bam.mdup.bam
../variants/MB-S7_GATCAG.sam.sorted.bam.mdup.bam
../variants/MB-S8_TAGCTT.sam.sorted.bam.mdup.bam
../variants/MB-S9_GGCTAC.sam.sorted.bam.mdup.bam
../variants/ref_siskin.sorted.bam.mdup.bam
```
Now create a new job file called `angsd_geno_like.job`.
Remember that you can do this with the job script generator from the [supercomputer website](https://rc.byu.edu/documentation/slurm/script-generator).
    
You should choose 4GB of RAM per CPU and 12 CPUs. The  `ANGSD`  command for to call the genotypes for a PCA is:
```
module load miniconda3/4.12-pws-472
conda activate angsd
angsd -GL 1 -out PCA -nThreads $SLURM_NPROCS -doGlf 2 -doMajorMinor 1 -SNP_pval 1e-6 -doMaf 1 -bam bamlist.txt
```
To submit the job, use: 
```
sbatch angsd_geno_like.job
``` 
When it is complete, look at the files in your directory. You should have three new files:  `PCA.arg`,  `PCA.beagle.gz`, and  `PCA.mafs.gz`. For the next step, we're going to generate a covariance matrix using the beagle file (which contains the genotype likelihoods) using  `PCAngsd`.

### 3. Generate a covariance matrix using  `PCAngsd`

In this step, we're going to use the  `PCA.beagle.gz`  file to create a covariance matrix in  `PCAngsd`. To create covariance matrix:  
```
module load miniconda3/4.12-pws-472
conda activate angsd
python ~/fsl_groups/fslg_pws472/apps/miniconda3/envs/angsd/bin/pcangsd-v.0.99/pcangsd.py -b PCA.beagle.gz -o siskin_PCA
```
After this is finished running, you should have a file in your directory called  `siskin_PCA.cov`. This is your covariance matrix and can be used to generate your PCA.

### 4. Create your PCA plot

You can plot the PCA with an  `R`  script that can be found in  `~/fsl_groups/fslg_pws472/compute/lab7/scripts/PCA_plot.r`. Copy it into your  `angsd`  folder. In order to run it, you need to have a list with the sample names in the same order as the original  `bamlist`,  `siskin_pop.txt`, in the same directory as the both the script and your covariance matrix. You can copy this file from  `~/fsl_groups/fslg_pws472/compute/lab7/angsd/siskin_pop.txt`. You may need to modify this list so that the filenames match perfectly with the file names in your `bamlist`. 
```
conda deactivate
conda activate r
Rscript PCA_plot.r
```
### 5. Run Admixture analysis with `NGSAdmix`

`NGSAdmix` is now part of the `ANGSD` package and can perform admixture analysis using the beagle file of genotype likelihoods that you generated in step 2. `cd` into your `jobs` directory and create a job file with the following commands. The parameter that you need to think about here is `K`, which as you learned in the lecture is the number of ancestral populations. Since we have two populations in this dataset, one from Venezuela and one from Guyana, we will set `K` to 2.
```
module load miniconda3/4.12-pws-472
conda activate angsd
NGSadmix -likes ../angsd/PCA.beagle.gz -K 2 -o ../angsd/siskin_admix -P $SLURM_NPROCS
```
When the job is finished, you will have a couple of new files in the `angsd` directory. `siskin_admix.fopt.gz` is a gzipped file that contains the estimated allele frequencies for each population for each locus. `siskin_admix.qopt` contains the estimated admixture proportions for each individual.

### 6. Create simple admixture plot
Now we will create a simple admixture plot using our results from `NGSadmix`
Copy the script, `admix_plot.r` from `~/fsl_groups/fslg_pws472/compute/lab7/scripts/admix_plot.r` to your `angsd` directory.
Make sure that `siskin_pop.txt` is still in your directory. This is another fast script, which is fine to run with `qrsh`.
```
conda activate r
Rscript admix_plot.r
```
You will now have a plot in an image called `siskin_admix.png`. Feel free to download it and take a look. You will notice that, for these populations, there is very little evidence of admixture with a `K` of 2.

### 7. Rerun steps 5 and 6 with a `K` of 3 and a `K` of 4
We don't have enough individuals to make this very interesting, but re-run number 5 and 6, with different `K` numbers. Name the output differently so you don't overwrite your first results. Modify the `R` script so that it reads the new file and writes a different image name. What do you notice?

### 8. Download the plots with `scp` or similar.
See [here](https://rc.byu.edu/wiki/?id=Transferring+Files) for more details.

### 9. For the Lab write-up
This lab will combined with lab 8 into a single lab write-up (double the amount of points and double the length). However, feel free to get started with this one. Consider the following as you write it up:
- Your lab write-up should contain clear methods on which analyses you performed and why
- When introducing each method, you should give a short explanation of what the software is actually doing
- Any plots that you generate should be included as figures
For the Discussion:
    + Think about what you learned about this population with the PCA. What do you notice? How are the populations clustering? Do you observe any population structure? Does it coincide with geography?
    + For the admixture, given there probably isn't enough individuals for a clear result, do you still notice anything? What changes as you change K? How might you get more information in the future?
