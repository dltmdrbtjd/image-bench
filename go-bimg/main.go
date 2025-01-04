package main

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/h2non/bimg"
)

func processImage(imagePath string, w, h int) error {
	fileName := strings.Replace(filepath.Base(imagePath), ".jpg", ".webp", 1)
	outputPath := filepath.Join("./output/bimg", fileName)

	imageData, err := os.ReadFile(imagePath)
	if err != nil {
		return err
	}

	start := time.Now()

	originalImage := bimg.NewImage(imageData)
	size, err := originalImage.Size()
	if err != nil {
		return err
	}

	aspectRatio := float64(size.Width) / float64(size.Height)

	options := bimg.Options{
		Quality: 80,
		Type:    bimg.WEBP,
	}

	if w != 0 && h != 0 {
		options.Width = w
		options.Height = h
	} else if w != 0 {
		options.Width = w
		options.Height = int(math.Round(float64(w) / aspectRatio))
	} else if h != 0 {
		options.Width = int(math.Round(float64(h) * aspectRatio))
		options.Height = h
	}

	newImage, err := originalImage.Process(options)
	if err != nil {
		return err
	}

	err = os.WriteFile(outputPath, newImage, 0644)
	if err != nil {
		return err
	}

	end := time.Now()
	fmt.Printf("%s 처리 시간: %v ms\n", fileName, end.Sub(start).Milliseconds())
	return nil
}

func main() {
	imagePaths := []string{
		"/app/assets/1.jpg",
		"/app/assets/2.jpg",
		"/app/assets/3.jpg",
		"/app/assets/4.jpg",
		"/app/assets/5.jpg",
		"/app/assets/6.jpg",
	}

	err := os.MkdirAll("./output/bimg", 0755)
	if err != nil {
		panic(err)
	}

	var wg sync.WaitGroup
	
	totalStart := time.Now()

	for _, path := range imagePaths {
		wg.Add(1)
		go func(p string) {
			defer wg.Done()
			if err := processImage(p, 0, 0); err != nil {
				fmt.Printf("이미지 처리 중 오류 발생 (%s): %v\n", p, err)
			}
		}(path)
	}

	wg.Wait()

	totalEnd := time.Now()
	fmt.Printf("\n전체 처리 시간: %v ms\n", totalEnd.Sub(totalStart).Milliseconds())
	fmt.Println("모든 이미지 처리 완료")
}