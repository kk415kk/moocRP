[Back to README](../README.md)

Data Distribution
================
This page is a work in-progress. You can contribute to it by forking this repository and making pull requests.

Data distribution is the process of distributing the data dumps of various MOOCs. Essentially, for each course's data that you want to make available, the following steps should be followed (suppose the course was BerkeleyX-CS169.1.x):

* Provided you have the dataset saved in a folder somewhere already, transfer it to the server that moocRP is on.
* Archive the contents of the folder (the data for the course) into a .ZIP file, where the name of the archive is the name of the course, i.e. <i>BerkeleyX-CS169.1.x.zip</i>.
* Move the archive to `moocRP_base/datasets/available/non_pii` or `moocRP_base/datasets/available/pii`, whichever is relevant.

Then, the dataset will appear on the dashboard page of moocRP, available for a user to request.

Analytics Data
==============
To make a dataset available to be selected from the Analytics tab of moocRP, the following steps should be followed:

* Using the <b>same name as the archive for data distribution (minus the .ZIP at the end)</b>, create a folder in `moocRP_base/datasets/extracted/DATA_MODEL_NAME/` named after the archive name.
* Extract the files of the dataset archive into the newly created folder. Make sure all the files are in the new folder and NOT nested inside some other folder, i.e. `moocRP_base/datasets/extracted/DATA_MODEL_NAME/ARCHIVE_NAME` should be as deep as the hierarchy of folders goes. 

The datasets should then appear in the Analytics tab, available for users to choose from if they've been granted access to the dataset.

<b>IMPORTANT NOTE:</b> the name of the archive file for data distribution, the folder name for analytics data MUST be consistent and must be the name of the course offering. moocRP relies on the names of the folders and archive files to detect which datasets are referring to the same course offering.

Example:
```
moocRP_base
  - datasets
  - keys
  - moocRP
    - available   // for data distribution
      - non_pii
        - data_model_1
          - BerkeleyX-CS169.1x.zip    // a dataset that's archived into a ZIP file
        - data_model_2
          - BerkeleyX-CS169.1x.zip    // same dataset as above, but scrubbed into a diff format
      - pii
        ...
    - extracted   // for analytics 
      - data_model_1
        - BerkeleyX-CS169.1x          // folder name is the same as the archive
          - data_model_1_data_file1
          - data_model_1_data_file2
      - data_model_2
        - BerkeleyX-CS169.1x
          - data_model_2_data_file1
          - data_model_2_data_file2
          - data_model_2_data_file3
    - encrypted
    ...
```