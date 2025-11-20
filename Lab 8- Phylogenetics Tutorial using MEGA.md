## Lab 8: Phylogenetics Tutorial using MEGA

In this tutorial you will make a phylogenetic tree using a program called MEGA with sequences
downloaded from BOLD systems.
1. Download MEGA on your computer by going to https://www.megasoftware.net/. Download this on to the machine you are going to use for the analysis, make sure to select the correct system (Windows, macOS, Ubuntu, etc.), Graphical (GUI) and MEGA X (64-bit). Click download, go through the user agreements and user profile, indicating that you are a student at a university. 
<img width="1164" alt="Screen Shot 2022-06-06 at 2 29 24 PM" src="https://user-images.githubusercontent.com/70609417/172243526-58e45974-8b19-4397-ae24-7512c58443fa.png">

2. Click on the `MEGA… _setup.exe` file in your downloads folder. There will be several set up options such as letting the program have access to your computer, setup language, licensing agreement as well as a location to install the program. For this location, direct it to your desktop as that will be the easiest place to run it from. You can do that using the browse tab and then select Users, your username, and then Desktop.

3. Once the program has been installed, it should be launched.

4. At this point we are going to leave MEGA to find the sequences to use for the phylogeny.

5. Navigate to BOLD systems http://www.boldsystems.org/index.php. Click on 'Data', found along the top bar. Click on 'Portal' and then 'Launch Portal'. 

6. Search for sequences of interest, ideally several genera within a family. To do this you can look up any family you are interested in and find several genera within that family. For example, if your family was Felidae you could search for Panthera, Neofelis, Lynx and Puma. This can be found from a simple google search. You should also choose an “outgroup” or a taxon that falls just outside your organism of interest. For example, in the case of Felidae, this could be a Hyena.

7. Download 9-10 sequences representing multiple genera into a fasta file. The best way to do this is to scroll down to the information about the sequences, click on the name of the marker, e.g. "COI-5P" and it will take you to a new page that contains information about the sequence. Open a plain text editor (I suggest [Sublime Text](https://www.sublimetext.com/)). Remember, a FASTA file consists a header that begins with `>` followed by the sequence on a new line. You might choose to use the species name plus the code as the header. Make sure you don't include any spaces in your header name. I suggest underscores instead. Once you have your header sequence written, you can copy and paste the sequence from the sequence page. Now, do this for each species in the same text file. When you are finished, save your file somewhere you can find it and name it, e.g., "lab8.fasta". 

8. Once you have a single fasta file with 9-10 sequences open MEGA.
<img width="870" alt="Screen Shot 2022-06-06 at 2 35 08 PM" src="https://user-images.githubusercontent.com/70609417/172244369-4f208655-f805-456c-a2a5-0e4169920fac.png">

9. In MEGA, go to 'File', 'Open a new session', select the fasta file you just created from the browse tab, click 'Align'.

10. A separate window should open with the names and sequences of each species in your fasta file. Select 'Alignment', then 'Align by MUSCLE', then 'OK', then 'OK'.

11. Once your data is aligned, select 'Data', then'Export Alignment', then 'MEGA Format'. Choose a location where you want the .MEG file to go. You will use this file to create your phylogenetic tree so be sure you know where it is saved.

12. Go back to your original MEGA window and make trees. You will make two phylogenetic trees using different computational methods. First, select the circle labeled 'PHYLOGENY' and then 'Construct/Test Maximum Likelihood Tree'. You will have to direct the program to the .meg file you saved from the alignment. Change the rates and patterns to Has Invariant Sites in the 'Rates among Sites' dropdown. Make sure the number of threads is 2. Click 'OK' and MEGA will generate your tree for you. You can then export your tree under the file tab.
<img width="582" alt="Screen Shot 2022-06-06 at 2 39 08 PM" src="https://user-images.githubusercontent.com/70609417/172244964-e9504ac4-c805-4f31-b5c7-570623bfb78c.png">

13. To root the tree on your outgroup, select the branch leading to your outgroup, select the "Subtree" dropdown, and then select "Root Tree".

14. Repeat this process by selecting the circle labeled 'PHYLOGENY' and then Construct/Test Maximum Parsimony Tree' **This is different from the Maximum likelihood tree**. Specify the same parameters and export the tree when you are finished.

15. Things to keep in mind for the write-up:
- What organism did you decide to study (if you do something similar to this for your
final project, you need to make sure you choose a different organism)?
- How did you retrieve the data? From where?
- What do you notice about the tree? Are the relationships as expected?
- Are there any evolutionary insights that you can make based on that tree?
