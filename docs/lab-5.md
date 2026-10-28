---
layout: lab
lab_num: 5
title: "Genome Assembly and QC"
blurb: "Work in a small group to assemble the genome of the Teton meltwater stonefly, Lednia tetonica, from PacBio HiFi reads using hifiasm, assess quality with BUSCO, and compare assemblies made with different amounts of data."
keywords: "genome assembly hifiasm pacbio hifi busco lednia tetonica stonefly plecoptera contiguity n50 coverage fasta fastq gfa group"
# Checklist ids are the localStorage keys for student progress.
# Never renumber an existing id; give new items a new, unused id.
checklist:
  - id: 0
    text: "Form your group and create your group folder"
  - id: 1
    text: "Link your group's PacBio HiFi reads into the group folder"
  - id: 2
    text: "Run assembly_stats on FASTA reads"
  - id: 3
    text: "Write a hifiasm job (24 cores, 4 hours); one member submits it"
  - id: 4
    text: "Convert GFA to FASTA with awk and delete the .bin files"
  - id: 5
    text: "Run assembly_stats on the assembled genome"
  - id: 6
    text: "Create and submit BUSCO job"
  - id: 7
    text: "View BUSCO short summary"
  - id: 10
    text: "Add your group's results to the class table"
  - id: 8
    text: "Compare assemblies across coverages and to other stonefly genomes"
  - id: 9
    text: "Start your own combined Labs 5-7 report"
---

In this lab, we will use PacBio HiFi sequencing to assemble the genome of _Lednia tetonica_, the Teton meltwater stonefly. _L. tetonica_ is found only in a handful of cold, glacier- and snowmelt-fed streams in the Teton Range of Grand Teton National Park, Wyoming. Because it depends on very cold water, it is vulnerable to warming and to the loss of the glaciers that feed its streams. Its close relative, _Lednia tumana_ from Glacier National Park, is listed as threatened under the U.S. Endangered Species Act. A high-quality reference genome is the foundation for the population genomic analyses we will do in Labs 6 and 7.

The full HiFi dataset for this genome is about 46.3 billion base pairs (6.4 million reads) from two PacBio Revio SMRT cells. That is far more than we need for a class exercise, so I have randomly subsampled the reads to three different depths of coverage: about **15x**, **20x**, and **30x**. Each smaller set is a subset of the larger ones.

Genome assembly is the most computationally demanding step in this course, so you will do this lab in **groups of two or three**. Each group will assemble one of the three read sets (I will assign your group a coverage), measure the coverage and contiguity of its assembly, and assess gene completeness with BUSCO. At the end, we will pool every group's results into a class table so that you can see how the amount of data affects the assembly, and compare your assemblies to the assembly made from the full dataset (collaborative unpublished work) and to other stonefly genomes on GenBank.

Everyone in the group should follow along with every step and understand every command, but only one member needs to submit each job. Your lab write-up is still your own.

### Step 1: Login to the supercomputer, create a group folder, and link the raw data

Open the command prompt or the terminal application and `ssh` into the supercomputer.

Your group will work in a shared folder in the class directory, so that every member can see the same files. Pick a short group name with no spaces (for example, the first names of your members, like `anna_ethan_iris`). **One member** of the group creates the folder and gives the rest of the group permission to write in it:
```
cd ~/groups/fslg_pws472/nobackup/archive/lab5_groups
mkdir anna_ethan_iris
chmod g+w anna_ethan_iris
```
**Every member** can then move into the group folder (use your own group name):
```
cd ~/groups/fslg_pws472/nobackup/archive/lab5_groups/anna_ethan_iris
```

The read files are large (the 30x compressed `FASTQ` is about 3.7 GB and the 30x `FASTA` is about 12.8 GB), so instead of copying them we will create _symbolic links_ to them. A symbolic link is a small file that points to the real file somewhere else, so every program can read it as if it were in your folder. We will use the `FASTQ` file for the assembly and the `FASTA` file to estimate the average read length and the total number of base pairs in the raw data.

The member who created the folder links your group's read set. Replace `15x` in both lines with your group's assigned coverage (`15x`, `20x`, or `30x`). Naming the links `reads.fastq.gz` and `reads.fasta` means that every command after this one is the same for all groups.
```
ln -s ~/groups/fslg_pws472/nobackup/archive/lab5_lednia/data/lednia_hifi_15x.fastq.gz reads.fastq.gz
ln -s ~/groups/fslg_pws472/nobackup/archive/lab5_lednia/data/lednia_hifi_15x.fasta reads.fasta
ls -l
```
The `ls -l` output shows an arrow (`->`) pointing to where each file really lives. Check that it points to your group's coverage.

### Step 2: Evaluate the raw reads with the assembly stats script

Copy the `assembly_stats` script to your folder.
```
cp -r ~/groups/fslg_pws472/nobackup/archive/lab5_lednia/data/assembly_stats ./
```
Make sure conda is loaded (`source ~/groups/fslg_pws472/.bashrc`) then run `assembly_stats` on your `FASTA` raw reads. Note that this script is primarily used to assess the completeness of a *genome assembly* not necessarily raw data. However, we will use it here to figure out the average read length and the total number of base pairs in the raw data. You will later use these to estimate the coverage in the raw data. Only one member needs to run it, and the output is saved in `read_stats.txt` so the whole group can see it.
```
python assembly_stats/assembly_stats.py reads.fasta > read_stats.txt
cat read_stats.txt
```
The 30x `FASTA` file contains about 1.76 million reads and takes about two minutes; the smaller sets are faster.

You should see two different `JSON` objects entitled "Contig Stats:" and "Scaffold Stats:". They will be the same values and, for this part of the exercise, what we are actually measuring are "Read Stats:". Take note of the total number of base pairs and the average read lengths. You'll use these later.

### Step 3: Prepare a job script for assembly and start your assembly job

**Every member** should create their own job script using the [Job Script Generator](https://rc.byu.edu/documentation/slurm/script-generator). Make sure that the job is limited to one node, select 24 processor cores, a wall-time of 4 hours, and 2 GB of RAM per processor. Add a name for your job and select the boxes to receive emails when your job begins, ends, and/or aborts. Copy the script from below **Job Script** on the webpage and add the following commands to the bottom, separated by line breaks:
```
source ~/groups/fslg_pws472/.bashrc
conda activate hifiasm
hifiasm -o lednia.asm -t 24 reads.fastq.gz
```
Compare your job scripts with your group and fix any differences. Then **one member** saves their script as `hifiasm.job` in the group folder and submits it with `sbatch`:
```
sbatch hifiasm.job
```
Please submit only one assembly per group. Each assembly uses 24 cores and 48 GB of memory for over an hour, and if everyone in the class submitted one at the same time, we would all wait in the queue much longer.

The member who submitted the job can check on it using `squeue -u <username>`. It took about an hour and a half for the 30x reads when I tested it (about 45 minutes for 20x and about 30 minutes for 15x). In the meantime, you can move to the next step to get the `BUSCO` job file ready for submission.

### Step 4: Generate a new job file for your `BUSCO` run

A **different member** from the one who submitted the assembly creates this job. Create a new job script using the [Job Script Generator](https://rc.byu.edu/documentation/slurm/script-generator). Make sure that the job is limited to one node, select 8 processor cores, 4 GB of RAM per processor, and a wall-time of 2 hours. Copy the resulting script into a new job file called `busco.job` in the group folder.

Copy the `busco_downloads` folder from the `pws472` class folder to your group folder
```
cp -r ~/groups/fslg_pws472/nobackup/archive/lab5_lednia/data/busco_downloads ./
```
Open the job file and add the following commands to the bottom, separated by line breaks:
```
source ~/groups/fslg_pws472/.bashrc
conda activate busco
busco -o lednia_busco -i lednia.asm.bp.p_ctg.fa -l insecta_odb10 -c 8 -m genome --offline
```
**Wait to submit this job until you complete step 5.**

### Step 5: Convert your completed assembly to `FASTA` and evaluate the contiguity using `assembly_stats`

Wait until the `hifiasm` job has completed. Once it has, you will have many new files in your folder. You can read the [`hifiasm` documentation](https://hifiasm.readthedocs.io/en/latest/interpreting-output.html) to understand what each file is. For these next steps, however, we want to convert the primary assembly (`p_ctg`) from a Graphical Fragment Assembly (`.gfa`) file to a `FASTA` file. This is simply for the convenience of using downstream tools. You can do this with the following command (you can run this interactively):
```
awk '$1 ~/S/ {print ">"$2"\n"$3}' lednia.asm.bp.p_ctg.gfa > lednia.asm.bp.p_ctg.fa
```
`hifiasm` also leaves behind three large `.bin` files (about 8.5 GB together for the 30x reads). These store the corrected reads and overlaps so that `hifiasm` can rerun quickly, but we won't need them, so delete them to save space in the class directory:
```
rm lednia.asm.*.bin
```
Now assess the contiguity of your assembly using the assembly stats script.
```
python assembly_stats/assembly_stats.py lednia.asm.bp.p_ctg.fa > assembly_stats.txt
cat assembly_stats.txt
```
You'll want to make sure that you keep this information handy. I'd like to see it in a table in your lab write-up. You will also use it to compare contiguity with other groups and with other stonefly genome assemblies. You will use the total number of base pairs in your assembly to estimate coverage from the total number of base pairs in your reads.

### Step 6: Run `BUSCO` on your assembly

Since you already created the job file, you can simply submit the new file with `sbatch`.
```
sbatch busco.job
```
### Step 7: Evaluate `BUSCO`

Once `busco` is complete (it took about 40 minutes for the 30x assembly when I tested it), you'll be able to view how many expected single copy orthologs are in your assembly. You can do this by viewing the `short_summary.specific.insecta_odb10.lednia_busco.txt` file.
```
cat lednia_busco/short_summary.specific.insecta_odb10.lednia_busco.txt
```
Complete BUSCOs include both single-copy and duplicated BUSCOs. Fragmented BUSCOs are where part of the gene was found, but the whole gene could not be confirmed. Missing BUSCOs are single copy orthologs that were not found in the assembly. More details about these output and more details on how to further analyze them can be found [here](https://busco.ezlab.org/busco_userguide.html#interpreting-the-results).

### Step 8: Add your results to the class table

Every group adds one line to a shared table, `class_results.tsv`, in the `lab5_groups` folder. **One member** runs the command below from your group folder, after replacing each value in capital letters:

- `GROUP`: your group name
- `COV`: your coverage (`15x`, `20x`, or `30x`)
- `CONTIGS`, `TOTAL_BP`, and `N50`: `sequence_count`, `total_bps`, and `N50` from your `assembly_stats.txt`
- `BUSCO`: the one-line summary from your `BUSCO` short summary, which starts with `C:`

```
echo -e "GROUP\tCOV\tCONTIGS\tTOTAL_BP\tN50\tBUSCO" >> ../class_results.tsv
```
Be sure to use `>>`, which adds a line to the end of the file. A single `>` would erase every other group's results. Once all of the groups have finished, view the whole table with:
```
column -t ../class_results.tsv
```

### Step 9: Compare your assembly to the other assemblies

Your assembly is a _contig_ assembly: each sequence is a stretch of genome that `hifiasm` could reconstruct without gaps. The _L. tetonica_ reference genome (collaborative unpublished work) started the same way, but used all of the HiFi data (about 109x coverage). Hi-C data, which captures which parts of the genome are physically close together in the nucleus, were then used to order and orient the contigs into 10 chromosome-length scaffolds. We will use that chromosome-level assembly as the reference genome in Labs 6 and 7.

Using the class table, fill in the first three rows of a table like this one:

| Assembly | Data | Number of contigs | Total length | Contig N50 |
|---|---|---|---|---|
| Class assembly | HiFi, ~15x | ? | ? | ? |
| Class assembly | HiFi, ~20x | ? | ? | ? |
| Class assembly | HiFi, ~30x | ? | ? | ? |
| _L. tetonica_ contigs (collaborative unpublished work) | HiFi, ~109x | 296 | 423.0 Mb | 4.39 Mb |
| _L. tetonica_ chromosome-level assembly (collaborative unpublished work) | HiFi + Hi-C | 149 scaffolds | 422.5 Mb | 39.99 Mb (scaffold N50) |

If more than one group assembled the same read set, did they get the same answer? Then look up two other stonefly genomes on GenBank and add them to your table:

- _Lednia tumana_, the threatened sister species from Glacier National Park: [GCA_003287335.1](https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_003287335.1/)
- _Nemoura dubitans_, another member of the family Nemouridae from the Darwin Tree of Life project: [GCA_921293005.1](https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_921293005.1/)

For each one, note the sequencing technology, the reported coverage, and the contig N50.

<div class="writeup-box" markdown="1">

#### 📝 Lab Write-up (combined with Labs 6 and 7)

Labs 5, 6, and 7 all use _Lednia tetonica_, so you will write them up together as a single report, which you will turn in after Lab 7 (triple the amount of points and triple the length). See the write-up box at the end of Lab 7 for how to put the report together. Get started on the Lab 5 part now, while the details are fresh. You worked as a group for this lab, but each member should write their own report.

For the Lab 5 part, include:


- Full details of the methods that you used, including commands to each piece of software.
- The amount of coverage of HiFi PacBio data that your group used (_Hint:_ you can estimate this by dividing the total number of base pairs in the reads by the total number of base pairs in your assembly).
- The contiguity stats and `BUSCO` results of the 15x, 20x, and 30x assemblies, in a table. How do contiguity and completeness change as coverage increases? How do they compare to the contig assembly made with ~109x? What does that tell you about how much HiFi coverage you need for a good assembly? (_Hint:_ look at the total length and the duplicated `BUSCO`s, not just the N50. _L. tetonica_ is diploid, so the two copies of each chromosome differ at many sites. Why might an assembler with too little data keep both copies of some regions?)
- How do the class assemblies compare to the _Lednia tumana_ and _Nemoura dubitans_ assemblies on GenBank? Examine the differences in sequencing technology, the differences in coverage, and the differences in contiguity.
- Your `BUSCO` results. What do they tell you about the completeness of your assembly?

</div>
