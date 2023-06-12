import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-2" });

//event Handler --> Entry point
export const handler = async(event) => {
    console.log(event)
    console.log(event.queryStringParameters)

    if (!event.queryStringParameters.date || !event.queryStringParameters.restaurant || event.queryStringParameters.restaurant == 'null') {
        console.log(`Booking info requested but no date or restaurant provided.`)
        return {
            statusCode: 400,
            body: 'Both "date" and "restaurant" parameters are required.',
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Credentials': true, 
                'Content-Type': 'application/json',
            },
        };
    }

    let date = event.queryStringParameters.date;
    let restaurant = event.queryStringParameters.restaurant;
    console.log(`Booking info requested. Restauraunt = ${restaurant} and Date = ${date}`)

    const queryParams = {
        TableName: "bookings.megabytten.org",
        KeyConditionExpression: "#restaurantDate = :restaurantDate",
        ExpressionAttributeNames: {
            "#restaurantDate": "restaurant-date"
        },
        ExpressionAttributeValues: {
            ":restaurantDate": { S: `${restaurant}#${date}` }
        },
    };

    try {
        const queryCommand = new QueryCommand(queryParams);
        const queryResult = await client.send(queryCommand);
        
        if (!queryResult.Items || queryResult.Items.length === 0) {
            console.log('No bookings found!')
            return {
                statusCode: 201,
                body: null,
                headers: {
                    'Access-Control-Allow-Origin': '*', 
                    'Access-Control-Allow-Credentials': true, 
                    'Content-Type': 'application/json',
                },
            };
        }
    
        // Convert items from DynamoDB AttributeValue format to JSON
        let bookings = queryResult.Items.map(item => {
            return item.time ? parseFloat(item.time.N) : null;
        }).filter(time => time !== null);
        
    
        console.log('Bookings found:', bookings)
        return {
            statusCode: 200,
            body: JSON.stringify(bookings),
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Credentials': true, 
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Error" }),
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Credentials': true, 
                'Content-Type': 'application/json',
            },
        };
    }    
};
