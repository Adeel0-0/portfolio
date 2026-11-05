---
title: Palm-tree detection
summary: Turning aerial imagery into an object-detection workflow.
description:
  - A computer-vision project exploring palm-tree detection in aerial images.
  - YOLO-based models identify candidate trees, with an application pipeline for processing images and reviewing detections.
role: Model training and application development
status: completed
category: Computer vision
skills: [Python, YOLOv5/v7, OpenCV, Flask, PostgreSQL]
updatedAt: '2026-10-17'
draft: false
featuredOrder: 2
visual: vision
repositoryUrl: https://github.com/Adeel0-0/PALM-TREE-DETECTION
diagram: [Aerial image, Preprocessing, YOLO detection, Review, Stored results]
---

## The problem

Large aerial image sets make manual tree identification repetitive. This project explores how an object detector can help identify candidate palm trees for review.

## My contribution

I worked with YOLOv5 and YOLOv7 models and the Python tooling around image processing. The public repository contains the model project and is linked above for inspection.

## Approach

Images move through preprocessing and inference before detections are reviewed. Keeping the model separate from image ingestion makes it possible to experiment with different detectors without rewriting the surrounding application.

## Evaluation

Detection quality depends on image resolution, the annotation policy, and the split between training and evaluation images. A benchmark number without those details would conceal more than it explains, so this page focuses on the implementation.

## Trade-offs and limitations

Overlapping vegetation and changes in viewpoint can produce missed or duplicate detections. Model output should be treated as candidate annotations, with a review step suited to the use case.

## Next steps

Publish a reproducible evaluation with representative images, dataset provenance, and a clear account of false positives and missed trees.
