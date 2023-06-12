import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-2" });

export const handler = async(event) => {
    console.log('Received event:', event)

    if (!event.name || !event.number || !event.email || !event.date || !event.time || !event.restaurantName || !event.party) {
        console.log(`Booking info provided is incomplete.`)
        return {
            statusCode: 400,
            body: 'All fields ("name", "number", "email", "date", "time", "party" and "restaurantName") are required.',
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Credentials': true, 
                'Content-Type': 'application/json',
            },
        };
    }

    if (event.restaurantName.toLowerCase() != 'megabytten'){
        console.log(`Restaurant Not Recognised.`)
        return {
            statusCode: 400,
            body: `Restaurant Not Recognised.`,
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Credentials': true, 
                'Content-Type': 'application/json',
            },
        };
    }

    const bookingData = {
        "restaurant-date": event.restaurantName + "#" + event.date,
        "time": event.time,
        "name": event.name,
        "number": event.number,
        "email": event.email,
        "party": event.party.toString()  // DynamoDB bit finicky - must change to string before submitting
    };

    console.log('Formatted bookingData:', bookingData);

    const putParams = {
        TableName: "bookings.megabytten.org",
        Item: {
            "restaurant-date": { S: bookingData["restaurant-date"] },
            "time": { N: bookingData["time"].toString() },
            "name": { S: bookingData["name"] },
            "number": { S: bookingData["number"] },
            "email": { S: bookingData["email"] },
            "party": { N: bookingData["party"] }
        },
    };

    try {
        const putCommand = new PutItemCommand(putParams);
        const result = await client.send(putCommand);
        console.log('PutItemCommand result:', result);
    } catch (error) {
        console.error('Error inserting item into DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error inserting item into DynamoDB', error: error }),
            headers: {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Credentials': true, 
                'Content-Type': 'application/json',
            },
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Successfully added booking in DynamoDB" }),
    };

};
