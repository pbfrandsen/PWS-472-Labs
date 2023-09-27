## Lab 1: Estimating FST from empirical data

Navigate to [http://genepop.curtin.edu.au] (http://genepop.curtin.edu.au). This is the website for the GenePop software. GenePop can do many different population genetics operations. However, today, we will be using GenePop to estimate FST values from empirical data. We are going to be using the version that comes packed with Biopython. We will get started by doing some of the things outlined [here] (https://www.tutorialspoint.com/biopython/biopython_population_genetics.htm). 

Click on the “Data input format” link under “Additional Help Files”. This will take you [here] (http://genepop.curtin.edu.au/help_input.html), which outlines the details about the file formats acceptable to GenePop. Read over the details and note the particulars about the file format.

Return to the home page and click on the [“Option 6 Help”] (http://genepop.curtin.edu.au/Option6.html) to the right of option 6. Read through the sub options. I just want you to get a taste for the types of FST analyses that can be run. We will be doing a more “vanilla” analysis, but it is good for you to understand the other types of things that you can do.

Now, open your terminal/command prompt and `ssh` into the supercomputer.

Now navigate to your compute directory and create a new directory entitled `lab1`. 

```	
cd ~/compute
mkdir lab1
```

Now copy the data for this exercise from our shared folder into your `lab1` directory and change directories into your `lab1` directory.

```
cp ~/fsl_groups/fslg_pws472/compute/Lab1/sample_pop.txt lab1
cd lab1
```

The data contained in this file are for three loci (Loc1, Loc2, and Loc3) spread over 3 populations. For purposes of this tutorial, let's assume that the sample file contains three fish populations and that they occupy three different ecological niches. Population 1 can be found in lakes, population 2 can be found in the running water in nearby streams, and population 3 can be found in the pools in nearby streams.

To get started, let's load conda and switch to your `biopython` virtual environment.
	
```
module load miniconda3/4.12-pws-472
conda activate biopython	
```

Now, `(biopython)` should be in front of your cursor. Next, lets start up Python.

```
python
```

Now, we can look at the populations in our file to see if everything loads in correctly. Anything that starts with “#” below is a comment and should not be entered. 

```
# Load the GenePop module from Biopython
	from Bio.PopGen import GenePop
	
# Load your pop file
	record = GenePop.read(open("sample_pop.txt"))
	
# Now check to ensure that everything loaded properly
	record.populations
	
# Now see that your locus names load properly
	record.loci_list
```

Ok, now we can load the `EasyController`, which will allow us to conduct some tests (for full capability, check [here] (https://biopython.org/docs/1.75/api/Bio.PopGen.GenePop.EasyController.html)). 

```
from Bio.PopGen.GenePop.EasyController import EasyController
three_pops = EasyController("sample_pop.txt")
print(three_pops.get_basic_info())
```
Now, let's run an FST on all three. You can do this with:

```
three_pops.get_multilocus_f_stats()
```

This will output the three populations' averaged FIS, FST, and FIT (in that order). Now, I would like to you to run the following analyses, modifying the input file so that it works for each analysis. The results from these analyses should be placed into a table as part of your lab interpretation. In order to conduct pairwise comparisons, you'll need to make a copy of the file and modify it so that it only includes two populations. In order to conduct three population comparisons, you can use the entire file.

1. Estimate FST values between Pop1 and Pop2
2. Estimate FST values between Pop1 and Pop3
3. Estimate FST values between Pop2 and Pop3
4. Estimate FST values for all three populations

Questions to consider for your lab interpretation:
1. Is there any difference between and among these populations, given the FST values that you have estimated?
2. What might this suggest about the different habitat types?
3. Does each locus tell the same story about the differences between these populations?
4. Why might that be?

PS: If you want to exit from the Python, use `quit()`.
