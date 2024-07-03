package models

import (
	"bytes"
	"fmt"
	"log"
)

type Board struct {
	Cells [][]Cell `json:"cells"`
}

type Cell struct {
	Bonus Bonus `json:"bonus"`
	Tile *Tile `json:"tile"`
	Col int `json:"col"`
	Row int `json:"row"`
}

type PlayedWord struct {
	Word string
	Points int
}

type AllPlayedWords struct {
	Words []PlayedWord
	TotalPoints int
}

type Bonus string

const (
	DOUBLE_LETTER Bonus = "DL"
	TRIPLE_LETTER Bonus = "TL"
	DOUBLE_WORD Bonus = "DW"
	TRIPLE_WORD Bonus = "TW"
	NONE Bonus = ""
)

var STANDARD_SCRABBLE_BONUSES = [15][15]Bonus {
	{"TW", "", "", "TL", "", "", "", "TW", "", "", "", "TL", "", "", "TW"},
	{"", "DW", "", "", "", "TL", "", "", "", "TL", "", "", "", "DW", ""},
	{"", "", "DW", "", "", "", "DL", "", "DL", "", "", "", "DW", "", ""},
	{"DL", "", "", "DW", "", "", "", "DL", "", "", "", "DW", "", "", "DL"},
	{"", "", "", "", "DW", "", "", "", "", "", "DW", "", "", "", ""},
	{"", "TL", "", "", "", "TL", "", "", "", "TL", "", "", "", "TL", ""},
	{"", "", "DL", "", "", "", "DL", "", "DL", "", "", "", "DL", "", ""},
	{"TW", "", "", "DL", "", "", "", "DW", "", "", "", "DL", "", "", "TW"},
	{"", "", "DL", "", "", "", "DL", "", "DL", "", "", "", "DL", "", ""},
	{"", "TL", "", "", "", "TL", "", "", "", "TL", "", "", "", "TL", ""},
	{"", "", "", "", "DW", "", "", "", "", "", "DW", "", "", "", ""},
	{"DL", "", "", "DW", "", "", "", "DL", "", "", "", "DW", "", "", "DL"},
	{"", "", "DW", "", "", "", "DL", "", "DL", "", "", "", "DW", "", ""},
	{"", "DW", "", "", "", "TL", "", "", "", "TL", "", "", "", "DW", ""},
	{"TW", "", "", "TL", "", "", "", "TW", "", "", "", "TL", "", "", "TW"},
}

func NewBoard() Board {
	cells := generateScrabbleBoard()

	return Board{
		Cells: cells,
	}
}

func (b *Board) PutTilesOnBoard(cells []Cell) error {
	for _, cell := range cells {
		if (cell.Tile != nil &&
			cell.Row <= len(b.Cells) - 1 &&
			cell.Col <= len(b.Cells[0]) - 1) {

			// Place tiles on board
			b.Cells[cell.Row][cell.Col].Tile = cell.Tile
		} else {
			log.Printf("row: %d, col: %d", cell.Row, cell.Col)
			return fmt.Errorf("invalid tile placement supplied")
		}
	}

	return nil
}

func (b *Board) ValidateTilePlacement() error {
	log.Println("ValidateTilePlacement is not implemented yet")

	return nil
}

func (b *Board) GetPlayedWords() (AllPlayedWords, error) {
	var playedWords AllPlayedWords
	cells := b.getCellsWithInPlayTiles();
	
	// Check if word is horizontal or vertical
	isHorizontal := len(cells) == 1 || cells[0].Row == cells[1].Row

	if isHorizontal {
		playedWords = b.getHorizontalPlayedWords(cells)
	} else {
		playedWords = b.getVerticalPlayedWords(cells)
	}

	// Give +50 bonus if all tiles are played
	if len(cells) == 7 {
		playedWords.TotalPoints += 50
	}

	return playedWords, nil
}

func (b *Board) getVerticalPlayedWords(cells []Cell) AllPlayedWords {
	played := AllPlayedWords{
		Words: []PlayedWord{},
		TotalPoints: 0,
	}
	mainWordCells := b.getVerticalWordCells(cells[0])
	mainWord := getPlayedWordFromCells(mainWordCells)
	played.TotalPoints += mainWord.Points
	played.Words = append(played.Words, mainWord)

	for _, cell := range mainWordCells {
		if cell.Tile.InPlay {
			cells := b.getHorizontalWordCells(cell)

			if len(cells) > 1 {
				word := getPlayedWordFromCells(cells)
				log.Printf("ADDING %d to total points", word.Points)
				played.TotalPoints += word.Points
				played.Words = append(played.Words, word)
			}
		}
	}

	log.Printf("TOTAL POINTS: %d", played.TotalPoints)

	return played
}

func (b *Board) getHorizontalPlayedWords(cells []Cell) AllPlayedWords {
	played := AllPlayedWords{
		Words: []PlayedWord{},
		TotalPoints: 0,
	}
	mainWordCells := b.getHorizontalWordCells(cells[0])
	mainWord := getPlayedWordFromCells(mainWordCells)
	played.TotalPoints += mainWord.Points
	played.Words = append(played.Words, mainWord)

	for _, cell := range mainWordCells {
		if cell.Tile.InPlay {
			cells := b.getVerticalWordCells(cell)
			
			if len(cells) > 1 {
				word := getPlayedWordFromCells(cells)
				log.Printf("ADDING %d to total points", word.Points)
				played.TotalPoints += word.Points
				played.Words = append(played.Words, word)
			}
		}
	}

	log.Printf("TOTAL POINTS: %d", played.TotalPoints)

	return played
}

func getPlayedWordFromCells(cells []Cell) PlayedWord {
	var stringBuffer bytes.Buffer
	points := 0
	tripleWordBonus := 0
	doubleWordBonus := 0

	for _, cell := range cells {
		stringBuffer.WriteString(cell.Tile.Letter)
		points += calculateCellPoints(cell)
		log.Printf("SCORED: %d\n", points)

		if cell.Tile != nil && cell.Tile.InPlay && cell.Bonus == DOUBLE_WORD {
			doubleWordBonus += 1
		} else if cell.Tile != nil && cell.Tile.InPlay && cell.Bonus == TRIPLE_WORD {
			tripleWordBonus += 1
		}
	}

	// Check for double word bonuses
	if doubleWordBonus > 0 {
		log.Println("DOUBLE WORD!")
		points *= (2 * doubleWordBonus)
	}
	
	// Check for triple word bonuses
	if tripleWordBonus > 0 {
		log.Println("TRIPLE WORD!")
		points *= (3 * tripleWordBonus)
	}

	return PlayedWord{
		Word: stringBuffer.String(),
		Points: points,
	}	
}

func calculateCellPoints(cell Cell) int {
	log.Println("###")
	log.Println(cell)
	log.Println(cell.Tile)

	if cell.Tile != nil {
		if cell.Tile.InPlay && cell.Bonus == DOUBLE_LETTER {
			return cell.Tile.Value * 2
		} else if cell.Tile.InPlay && cell.Bonus == TRIPLE_LETTER {
			return cell.Tile.Value * 3
		} else {
			return cell.Tile.Value
		}
	}

	log.Println("POINTS ERR, tile either nil or not in play")

	return 0
}

func (b *Board) getHorizontalWordCells(startingCell Cell) []Cell {
	currentCell := startingCell
	cells := []Cell{
		startingCell,
	}
	
	// Get right side
	for currentCell.Tile != nil && currentCell.Col + 1 < len(b.Cells[0]) {
		currentCell = b.Cells[currentCell.Row][currentCell.Col + 1]
		
		if currentCell.Tile != nil {
			cells = append(cells, currentCell)
		}
	}

	// Reset to center
	currentCell = startingCell

	// Get left side
	for currentCell.Tile != nil && currentCell.Col + 1 > 0 {
		currentCell = b.Cells[currentCell.Row][currentCell.Col - 1]

		if currentCell.Tile != nil {
			cells = append([]Cell{currentCell}, cells...)
		}
	}

	return cells
}

func (b *Board) getVerticalWordCells(startingCell Cell) []Cell {
	currentCell := startingCell
	cells := []Cell{
		startingCell,
	}
	
	// Get top side
	for currentCell.Tile != nil  && currentCell.Row + 1 < len(b.Cells) {
		currentCell = b.Cells[currentCell.Row + 1][currentCell.Col]

		if currentCell.Tile != nil {
			cells = append(cells, currentCell) // TODO: PREPEND INSTEAD
		}
	}

	// Reset to center
	currentCell = startingCell

	// Get bottom side
	for currentCell.Tile != nil && currentCell.Row - 1 > 0 {
		currentCell = b.Cells[currentCell.Row - 1][currentCell.Col]

		if currentCell.Tile != nil {
			cells = append([]Cell{currentCell}, cells...)
		}
	}

	return cells
}

func (b *Board) ConfirmInPlayTiles() error {
	// Set all tiles that are in play to false
	for _, row := range b.Cells {
		for _, cell := range row {
			if cell.Tile != nil && cell.Tile.InPlay {
				cell.Tile.InPlay = false
			}
		}
	}

	return nil
}

func (b *Board) getCellsWithInPlayTiles() []Cell {
	cells := []Cell{}

	for _, row := range b.Cells {
		for _, cell := range row {
			if cell.Tile != nil && cell.Tile.InPlay {
				cells = append(cells, cell)
			}
		}
	}

	return cells
}

func generateScrabbleBoard() [][]Cell {
	var board [][]Cell

	for i, row := range STANDARD_SCRABBLE_BONUSES {
		var cells []Cell
		for j, bonus := range row {
			cells = append(cells, Cell{
				Bonus: Bonus(bonus),
				Col: j,
				Row: i,
			})
		}
		board = append(board, cells)
	}

	return board
}
