<?php
$f3=require('fatfree/lib/base.php');
new Session();

$f3->config('fatfree/config.ini');
//$f3->set('AUTOLOAD','public/pages/');

//$f3->route('GET /','');
//$f3->route('GET /','MainController->render');
$f3->route('GET /login','UserController->render');
$f3->route('GET /authenticate','UserController->authenticate');
$f3->route('GET /product','ProductController->test');

$f3->route('GET /',
    function() {
        echo 'Hello, world!';
    }
);

class WebPage {
    function display() {
        echo 'I cannot object to an object';
    }
}

$f3->route('GET /about','WebPage->display');

class CookieRecipe
{
    public $id = null;
    public $name = null;
    public $ingredients = null;
    public $directions = "Preheat oven to 350 degrees F (175 degrees C).
    In a large bowl, cream together the butter, butter flavored shortening, brown sugar, white sugar, eggs, and vanilla until smooth. Combine the flour, baking soda, cinnamon, cloves, and salt; stir into the sugar mixture. Stir in the oats and raisins. Drop by rounded teaspoonfuls onto ungreased cookie sheets.
    Bake 10 to 12 minutes until light and golden. Do not overbake. Let them cool for 2 minutes before removing from cookie sheets to cool completely. Store in airtight container. Make sure you get some, because they don't last long!";
    public $url = "http://allrecipes.com/Recipe/Beths-Spicy-Oatmeal-Raisin-Cookies/Detail.aspx?evt19=1";
	
    function showDataInJSON(){
    	header("Content-Type: application/json", true);
    	echo json_encode($this);
    }
}

$f3->route('GET /test',
    function($f3) {
        $myCookie = new CookieRecipe();
        $myCookie->id = 1;
        $myCookie->name = 'Beth\'s Spicy Oatmeal Raisin Cookies';
        $myCookie->ingredients= array(          "butter, softened" 		=> "half cup",
					        "butter flavored shortening"	=> "half cup", 
					        "packed light brown sugar" 	=> "one cup",
						"white sugar"			=> "half cup",
						"eggs"				=> "two",
						"vanilla extract"		=> "one teaspoon", 
						"all-purpose flour"		=> "one and a half cup",
						"baking soda"			=> "one teaspoon",
						"ground cinnamon"		=> "one teaspoon",
						"ground cloves"			=> "half teaspoon",
						"salt"				=> "half teaspoon",
						"rolled oats"			=> "three cups",
						"raisins"			=> "one cup"
						);
        $myCookie->showDataInJSON();
    }
);



$f3->run();