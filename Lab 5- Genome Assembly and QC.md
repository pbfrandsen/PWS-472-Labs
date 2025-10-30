## Lab 5: Genome Assembly and QC

In this lab, we will use the latest and greatest sequencing technology (PacBio HiFi) to assemble the genome of _Plodia interpunctella_, the pantry moth. We will also assess the sequencing coverage, the contiguity of the resulting assembly, and the gene completeness using BUSCO.

You will have an opportunity to explore GenBank assemblies of other moths and relate how this assembly compares to other moths in terms of contiguity.

### Step 1: Login to the supercomputer, create a new folder for your analysis, and copy over the raw data

Open the command prompt or the terminal application and `ssh` into the supercomputer.

Change directories into your archive directory and create a new directory called `lab5`.
```
cd ~/nobackup/archive
mkdir lab5
cd lab5
```
Copy the raw PacBio read `FASTQ` and `FASTA` files from our shared PWS 472 directory. We will use the `FASTQ` file for the assembly, but we will use the `FASTA` file to estimate the average read length and the total number of base pairs in the raw data.
```
cp ~/groups/fslg_pws472/nobackup/archive/lab5/data/m64140_201011_172335.Q20.fast* ./
```
Notice that, in the command above, we use a wildcard `*` to copy both the `FASTA` file and the `FASTQ` file.

### Step 2: Evaluate the raw reads with the assembly stats script

Copy the `assembly_stats` script to your folder.
```
cp -r ~/groups/fslg_pws472/nobackup/archive/lab5/data/assembly_stats ./
```
Make sure conda is loaded (`source ~/groups/fslg_pws472/.bashrc`) then run `assembly_stats` on your `FASTA` raw reads. Note that this script is primarily used to assess the completeness of a *genome assembly* not necessarily raw data. However, we will use it here to figure out the average read length and the total number of base pairs in the raw data. You will later use these to estimate the coverage in the raw data.
```
python assembly_stats/assembly_stats.py m64140_201011_172335.Q20.fasta
```
You should see two different `JSON` objects entitled "Contig Stats:" and "Scaffold Stats:". They will be the same values and, for this part of the exercise, what we are actually measuring are "Read Stats:". Take note of the total number of base pairs and the average read lengths. You'll use these later.

### Step 3: Prepare a job script for assembly and start your assembly job

Create a new job script using the [Job Script Generator](https://rc.byu.edu/documentation/slurm/script-generator). Make sure that the job is limited to one node, select 24 processor cores, a wall-time of 2 hours, and 1 GB per processor. Add a name for your job and select the boxes to receive emails when your job begins, ends, and/or aborts. Copy the script from below **Job Script** on the webpage and paste it into a new file called `hifiasm.job` in your folder. Use your favorite text editor to do this.

Open the job file and add the following commands to the bottom, separated by line breaks:
```
source ~/groups/fslg_pws472/.bashrc
conda activate hifiasm
hifiasm -o plodia.asm -t 24 m64140_201011_172335.Q20.fastq
```
Close the job file and submit it using `sbatch`
```
sbatch hifiasm.job
```
You can check on your job using `squeue -u <username>`. It should complete relatively quickly and you will receive an email when it does. In the meantime, you can move to the next step to install `BUSCO` and get the job file ready for job submission.

### Step 4: Generate a new job file for your `BUSCO` run

Create a new job script using the [Job Script Generator](https://rc.byu.edu/documentation/slurm/script-generator). Make sure that the job is limited to one node, select 4 processor cores, 4 GB of RAM per processor, and a wall-time of 12 hours. Copy the resulting script into a new job file called `busco.job`.

Copy the `busco_downloads` folder from the `pws472` class folder to your working folder
```
cp -r ~/groups/fslg_pws472/nobackup/archive/lab5/data/busco_downloads ./
```
d. Open the job file and add the following commands to the bottom, separated by line breaks:
```
source ~/groups/fslg_pws472/.bashrc
conda activate busco
busco -o plodia_busco -i plodia.asm.bp.p_ctg.fa -l insecta_odb10 -c 4 -m genome --offline
```
**Wait to submit this job until you complete step 5.**

### Step 5: Convert your completed assembly to `FASTA` and evaluate the contiguity using `assembly_stats`

Wait until you get the email that your `hifiasm` job has completed. Once it has, you will have many new files in your folder. You can read the `hifiasm` documentation to understand what each file is. For these next steps, however, we want to convert the final assembly from a Graphical Fragment Assembly (`.gfa`) file to a `FASTA` file. This is simply for the convenience of using downstream tools. You can do this with the following command (you can run this interactively):
```
awk '$1 ~/S/ {print ">"$2"\n"$3}' plodia.asm.bp.p_ctg.gfa > plodia.asm.bp.p_ctg.fa
```
Now assess the contiguity of your assembly using the assembly stats script.
```
python assembly_stats/assembly_stats.py plodia.asm.bp.p_ctg.fa
```
You'll want to make sure that you keep this information handy. I'd like to see it in a table in your lab write-up. You will also use it to compare contiguity with an existing moth genome assembly. You will use the total number of base pairs in your assembly to estimate coverage from the total number of base pairs in your reads.

### Step 6: Run `BUSCO` on your assembly

Since you already created the job file, you can simply submit the new file with `sbatch`.
```
sbatch busco.job
```
### Step 7: Evaluate `BUSCO` and lab write-up questions to answer

Once `busco` is complete (this may take quite some time), you'll be able to view how many expected single copy orthologs are in your assembly. You can do this by viewing the `short_summary.specific.insecta_odb10.plodia_busco.txt` file.
```
cat plodia_busco/short_summary.specific.insecta_odb10.plodia_busco.txt
```
Complete BUSCOs include both single-copy and duplicated BUSCOs. Fragmented BUSCOs are where part of the gene was found, but the whole gene could not be confirmed. Missing BUSCOs are single copy orthologs that were not found in the assembly. More details about these output and more details on how to further analyze them can be found [here](https://busco.ezlab.org/busco_userguide.html#interpreting-the-results).

Items to ensure that you include in your lab write-up:

- Full details of the methods that you used, including commands to each piece of software.
- The amount of coverage of HiFi PacBio data that was generated (_Hint:_ you can estimate this by dividing the total number of base pairs in the reads by the total number of base pairs in the assembly).
- The contiguity stats of the genome that you assembled. How does this compare to another moth genome that you compared it to on GenBank? One that you can compare it to is the Diamondback moth, [_Plutella xylostella_](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_932276165.1). Examine the differences in sequencing technology, the differences in coverage, and the differences in contiguity.
