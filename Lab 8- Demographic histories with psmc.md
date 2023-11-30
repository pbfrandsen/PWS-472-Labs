## Lab 8: Demographic histories with `psmc`

During this lab, we will use our bam files (generated in lab 7) to estimate demographic histories using the pairwise sequential Markovian coalescent (PSMC).

The first thing you'll want to do is create a `lab8` directory in your `~/compute` directory. Change directories into your newly created `lab8` directory. Then copy both the `genome` directory and the `variants` directory from `~/fsl_groups/fslg_pws472/compute/lab7` into your new `lab8` directory. **Hint**: Use `cp -r ~/fsl_groups/fslg_pws472/compute/lab7/genome ./` to copy the genome directory. Just replace "genome" with "variants" in the first path to copy over the variants folder as well.

### 1. Identify heterozygous sites using `mpileup` and `bcftools`, then export to a diploid `FASTQ` that can be converted into a special `PSMC` `FASTA` file.
* Create a new directory in `lab8` called `psmc`
* Create another new directory in `lab8` called `jobs`
* This process is outlined in the commands below. The `-d` parameter is for minimum depth, which should be about 1/3 of the average depth of coverage, and `-D` is maximum depth, which should be about twice the depth of coverage. In this case, for the reference genome, we use `-d 16 and -D 120`. Note that, for the resequencing jobs, you will have to adjust these parameters. These have only 10x coverage on average so should be approximately `-d 3` and `-D 25`. Submit the following job from your `jobs` directory from a job file called `diploid_fastq.job`. Ensure that you run the reference from Guyana in this first run:
	+ **module to load**: ```module load samtools/1.9```
	+ **module to load**: ```module load bcftools```
	+ **command**: 

```
samtools mpileup -C50 -uf ../genome/Contig86_pilon.fasta ../variants/ref_siskin.sorted.bam.mdup.bam | bcftools call -c - | vcfutils.pl vcf2fq -d 16 -D 120 | gzip > ../psmc/diploid.fq.gz
```

### 2. `PSMC`
* In this step, we will create the `PSMC` `FASTA` file. Do this by submitting this job using a job file in your `jobs` directory.
	+ **module to load**: ```module load psmc```
	+ **command**: 
```
fq2psmcfa -q20 ../psmc/diploid.fq.gz > ../psmc/siskin.psmcfa
```

* First, run a single `PSMC` run.
	+ **module to load**: `module load psmc`
	+ **command**:
```
psmc -N25 -t15 -r5 -p "4+25*2+4+6" -o ../psmc/siskin.psmc ../psmc/siskin.psmcfa
```

* Finally, we can create the `PSMC` plot without bootstrapping. This doesn't take a long time so go ahead and run it directly into the `lab8/psmc` directory.
    + **module to load**: `module load gnuplot`
    + **module to load**: `module load psmc`
    + **command**: 
```
psmc_plot.pl -p -u 3.18e-09 -g 4.2 siskin_psmc siskin.psmc
```

### 3. Run `PSMC` on your resequencing data
* Now re-run the first two steps on your resequencing data (the additional 9 individuals) to generate additional `psmc` plots. Keep in mind that you should both adjust the `-d` and `-D` parameters *and* specify a correction when plotting the data. When I looked at the number of SNPs in 10x coverage data as compared with 100x coverage data, I noticed that we lost about 20% of our high confidence SNPs. In order to correct for this, you can specify `-M "sample_name=0.2"` and adjust the scale on the y axis `—-pY35`, for example, for MB-S6, you might specify something like:
```
psmc_plot.pl —-pY35 -M "mbs6=0.2" -p -u 3.18e-09 -g 4.2 mbs6 MB-S6.psmc
```

See appendix II in the [psmc documentation](https://github.com/lh3/psmc) for more information. 

### 4. Download the plots with `scp` or similar.
See [here](https://rc.byu.edu/wiki/?id=Transferring+Files) for more details.

### Key takeaways for the lab write-up

* What do you notice about your `psmc` plots from the various resequencing runs? How are they similar? How do they differ? Why might this be?

* What do these, collectively, tell us about the demographic history of the various individuals? Do you notice any trends among populations? Remember that JH-12872, MB-12866, MB-12867, MB-12868, and ref_siskin are from Guyana and the rest are from Venezuela.