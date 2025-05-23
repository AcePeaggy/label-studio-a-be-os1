---
title: Audio
type: tags
order: 301
meta_title: Audio Tag for Audio Labeling
meta_description: Customize Label Studio with the Audio tag for advanced audio annotation tasks for machine learning and data science projects.
---

The Audio tag plays audio and shows its waveform. Use for audio annotation tasks where you want to label regions of audio, see the waveform, and manipulate audio during annotation.

Use with the following data types: audio

{% insertmd includes/tags/audio.md %}

### Example

Play audio on the labeling interface

```html
<View>
  <Audio name="audio" value="$audio" />
</View>
```
### Example

Play audio with multichannel support

```html
<View>
  <Audio name="audio" value="$audio" splitchannels="true" />
</View>
```
### Example

Audio classification

```html
<View>
  <Audio name="audio" value="$audio" />
  <Choices name="ch" toName="audio">
    <Choice value="Positive" />
    <Choice value="Negative" />
  </Choices>
</View>
```
### Example

Audio transcription

```html
<View>
  <Audio name="audio" value="$audio" />
  <TextArea name="ta" toName="audio" />
</View>
```
### Example

Labeling configuration to label regions of audio and rate the audio sample

```html
<View>
  <Labels name="lbl-1" toName="audio-1">
    <Label value="Guitar" />
    <Label value="Drums" />
  </Labels>
  <Rating name="rate-1" toName="audio-1" />
  <Audio name="audio-1" value="$audio" />
</View>
```
### Example

Sync with video

```html
<View>
  <Video name="video-1" value="$video" sync="audio-1" />
  <Labels name="lbl-1" toName="audio-1">
    <Label value="Guitar" />
    <Label value="Drums" />
  </Labels>
  <Audio name="audio-1" value="$video" sync="video-1" />
</View>
```
### Example

Sync with paragraphs

```html
<View>
  <Labels name="lbl-1" toName="audio-1">
    <Label value="Guitar" />
    <Label value="Drums" />
  </Labels>
  <Audio name="audio-1" value="$audio" sync="txt-1" />
  <Paragraphs audioUrl="$audio" sync="audio-1" name="txt-1" value="$text" layout="dialogue" showplayer="true" />
</View>
```
