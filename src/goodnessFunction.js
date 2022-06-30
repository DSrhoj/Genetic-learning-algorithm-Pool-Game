//Player 1 is AI, player 2 is user.
var player = (checkpoints.length%2==0)?"player1":"player2";

function goodness(snapshot1, snapshot2){

    let goodnessGrade = 0;
    for( let i = 0; i< snapshot1.length; i++){

        if(snapshot1[i]!=null){

            var sameBallNextSnapshot = snapshot2.find(ball => {
                if(ball!=null){
                    return ball.id == snapshot1[i].id;
                }
                else false;
            });

            //Counting players balls to check if only the 8ball is left.
            var playersBallCountPrevious = snapshot1.filter(ball => { 
                if(ball){return ball.label==player}
                else return false;
            }).length;

            //Cue ball.
            if(snapshot1[i].id==1){
                goodnessGrade +=0;
            }
            //8ball not yet.
            else if(sameBallNextSnapshot == undefined && playersBallCountPrevious!=0 && snapshot1[i].id==2){
                goodnessGrade -=25000;
            }
            //8ball when rest are potted.
            else if(sameBallNextSnapshot == undefined && playersBallCountPrevious==0 && snapshot1[i].id==2){
                goodnessGrade +=25000;
            }
            //Players ball and ball hit the hole and got removed.
            else if(sameBallNextSnapshot == undefined && snapshot1[i].label == player){
                goodnessGrade += 2500;
            }
            //Not the players ball and ball hit the hole and got removed.
            else if(sameBallNextSnapshot == undefined && snapshot1[i].label != player){
                goodnessGrade -= 2500;
            }
            //Players ball and it didnt hit the hole.
            else if(snapshot1[i].label == player){
                distanceImprovement = distanceToNearestHole(snapshot1[i])-distanceToNearestHole(sameBallNextSnapshot);
                goodnessGrade += distanceImprovement;
            }
            //Not the players ball and it didnt hit the hole.
            else if(snapshot1[i].label != player){
                distanceImprovement = distanceToNearestHole(snapshot1[i])-distanceToNearestHole(sameBallNextSnapshot);
                goodnessGrade -= distanceImprovement;
            }
        }
    }

    return goodnessGrade;
}

function distanceToNearestHole(ball){
    bestDistance = 10000;
    for(let i=0; i<holes.length; i++){
        let distance = Math.sqrt(Math.pow((ball.position.x - holes[i].body.position.x),2) + Math.pow((ball.position.y - holes[i].body.position.y),2));
        if(bestDistance>distance){
            bestDistance = distance;
        }
    }

    return bestDistance;
}