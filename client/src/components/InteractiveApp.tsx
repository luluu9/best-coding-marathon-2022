//@ts-nocheck
import { MapWithHeatmap } from "./Interactives/Map";
import { useState, useEffect } from "react";
import { fetchHeatmapData, fetchTableData, mockData } from "../api/api";
import Select from "react-select";
import { heatmapData, weightData, defaultWeights, defaultCategories } from "../types";
import { SliderSet } from "./Interactives/SliderSet";

//import "antd/dist/antd.css";
import {Table} from "antd";

export function InteractiveApp(){
    const options = [
            { value: 'green', label: 'Zielone Miasto' },
            { value: 'innovative', label: 'Innowacyjne Miasto'},
            { value: 'together', label: 'Wspólne Miasto'},
            { value: 'accessible', label: 'Dostępne Miasto' },
            { value: 'custom', label: 'Moje Miasto' }
        ]


        const colourStyles = {
        
            option: (styles, { data, isDisabled, isFocused, isSelected }) => {
              return {
                ...styles,
                color: "#333333",
                "&:hover": {
                    // Overwrittes the different states of border
                    backgroundColor: isSelected ? "#a88566" : "#46a58a"},
                 backgroundColor: isSelected ? "#a88566" : "#116466"
              };
            },
            control: (base, state) => ({
                ...base,
                background: "#a88566",
                borderColor: "#a88566",
                boxShadow: state.isFocused ? null : null,
                "&:hover": {
                    borderColor: "#a88566"}
              })
          };
    

    const defaultWeights: weightData = {
        "edukacja": 1,
        "zdrowie": 1, 
        "rozrywka": 1, 
        "jedzenie": 1, 
        "sport": 1, 
        "kultura": 1, 
        "dzieci": 1,
        "kawiarnie": 1, 
        "natura": 1, 
        "biznes": 1, 
        "uslugi": 1, 
        "transport_publiczny": 1,
        "sklepy": 1
    }


    const defaultLat = 54.4;
    const defaultLon = 18.6;

   let [tableData, setTableData] = useState(mockData)

   const getTableData = () => {
    fetchTableData(defaultLat,defaultLon).then((response) => {
        console.log("res" + response);
        setTableData(response as tableData);
        console.log(tableData);
    })
}
        
     getTableData();
     
        

     
    
     const columns = [
        {
            title: "Kategoria",
            dataIndex: "category",
        },
        {
            title: "Ilość",
            dataIndex: "count",
        }
     ]

     const nestedColumns = [
        {
            title: "Nazwa",
            dataIndex: "name",
        },
        {
            title: "Typ",
            dataIndex: "type",
        },
        {
            title: "Odległość",
            dataIndex: "distance",
        }
     ]

     const categories:string[] = ["biznes","dzieci","edukacja","jedzenie","kawiarnie","kultura","natura","rozrywka","sklepy","sport","transport","uslugi","zdrowie"]


    const dataSource = [];



    for (let index =0; index < 13; index++){  
        let nestedDataSource = [];
        console.log(tableData);
        let places = tableData.places[categories[index]]
        for(let i = 0; i < places.length; i++)
        {
            let name = places[i][3];
            let type = places[i][2];
            let distance = places[i][5];
            nestedDataSource.push({
                key: i,
                name: name,
                type: type,
                distance: distance
            })
        }
        dataSource.push({
            key: index,
            category: categories[index],
            count: places.length,
            nestedData: nestedDataSource
        })
    }

    let[category, setCategory] = useState(options[0]);

    

    let [heatData, setHeatData] = useState([]);

      useEffect(() => {
        getData();
      }, []);


    const getData = (weights: weightData) => {
        fetchHeatmapData(weights).then((response) => {
            let res = response as heatmapData;
            setHeatData(res);
        })
    }

    

    const handleSliderChange = () => {
        if(category !== options[4]){
            setCategory(options[4]);
        }
    }

    

    

    return (
        <div className="UserApp">
            <h1>{category.label}</h1>
            
            <Select 
            className="react-select-container"
            classNamePrefix="react-select"
            defaultValue={category}
            onChange={setCategory}
            options={options}     
            styles={colourStyles}
            value={category}
            />

            
            <div className="MapPart">-
            <MapWithHeatmap
            options={options} 
            color={"#116466"}
            data={heatData}/>
            <SliderSet onValuesModified={handleSliderChange} onFormSubmitted={getData} categoryData={defaultCategories[category.value]}/>
            </div>
            <div id="tableDiv">
            <Table
                pagination={false}
                columns={columns}
                dataSource={dataSource}
                expandable={{
                    rowExpandable: (record) => record.count > 0,
                    expandedRowRender: (record) => {
                        return  <Table  
                                    columns={nestedColumns}
                                    dataSource={record.nestedData}
                                    pagination={false}>
                                </Table>;
                    }               
                }}
            ></Table>
            </div>
        </div>
    )
}