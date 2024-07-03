package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type DictionaryService struct {}

type Definition struct {
	Definition string `json:"definition"`
	Example string `json:"example"`
	Synonyms []string `json:"synonyms"`
	Antonyms []string `json:"antonyms"`
}

type Meaning struct {
	PartOfSpeech string `json:"partOfSpeech"`
	Definitions []Definition `json:"definitions"`
}

type DefinitionResponse struct {
	Word string `json:"word"`
	Origin string `json:"origin"`
	Meanings []Definition `json:"meanings"`
}

func NewDictionaryService() DictionaryService{
	return DictionaryService{}
}

func (s *DictionaryService) GetDefinition(word string) (*DefinitionResponse, error) {
	dictionaryApiUrl := fmt.Sprintf("https://api.dictionaryapi.dev/api/v2/entries/en/%s", url.PathEscape(word))
	resp, err := http.Get(dictionaryApiUrl)
	
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var definitionResponse DefinitionResponse
	err = json.Unmarshal(body, &definitionResponse)

	if err != nil {
		return nil, err
	}

	return &definitionResponse, nil
}

func (s *DictionaryService) ValidateWords(words []string) error {
	for _, word := range words {
		if _, err := s.GetDefinition(word); err != nil {
			return fmt.Errorf("One or more words provided were invalid")
		}
	}

	return nil
}